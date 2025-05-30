import { Request, Response, NextFunction } from 'express';
import Prescription from '../models/prescription.model';
import Patient from '../models/patient.model';
import { UserRole } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Add type declaration for populated prescription
interface PopulatedPrescription {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: Date;
    gender: string;
  };
  dermatologist: {
    firstName: string;
    lastName: string;
    email: string;
  };
  date: Date;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  notes?: string;
  followUpDate?: Date;
}

/**
 * Get all prescriptions
 * @route GET /api/prescriptions
 * @access Private
 */
export const getPrescriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient, dermatologist } = req.query;
    const filter: any = {};

    // Apply filters if provided
    if (patient) {
      filter.patient = patient;
    }

    if (dermatologist) {
      filter.dermatologist = dermatologist;
    }

    // If user is a dermatologist, only show their prescriptions
    if (req.user.role === UserRole.DERMATOLOGIST) {
      filter.dermatologist = req.user.id;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('dermatologist', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single prescription
 * @route GET /api/prescriptions/:id
 * @access Private
 */
export const getPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber dateOfBirth gender')
      .populate('dermatologist', 'firstName lastName email');

    if (!prescription) {
      return next(new AppError('Prescription not found', 404));
    }

    // Check if user has access to this prescription
    if (
      req.user.role === UserRole.DERMATOLOGIST &&
      prescription.dermatologist._id.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to access this prescription', 403));
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new prescription
 * @route POST /api/prescriptions
 * @access Private (Dermatologists only)
 */
export const createPrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient, diagnosis, medications, notes, followUpDate } = req.body;

    // Check if user is a dermatologist
    if (req.user.role !== UserRole.DERMATOLOGIST && req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Only dermatologists can create prescriptions', 403));
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient,
      dermatologist: req.user.id,
      diagnosis,
      medications,
      notes,
      followUpDate,
    });

    // Add prescription to patient's prescriptions
    await Patient.findByIdAndUpdate(patient, {
      $push: { prescriptions: prescription._id },
    });

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update prescription
 * @route PUT /api/prescriptions/:id
 * @access Private (Dermatologists only)
 */
export const updatePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { diagnosis, medications, notes, followUpDate } = req.body;

    // Find prescription
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return next(new AppError('Prescription not found', 404));
    }

    // Check if user is authorized to update this prescription
    if (
      req.user.role === UserRole.DERMATOLOGIST &&
      prescription.dermatologist.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to update this prescription', 403));
    }

    // Update fields
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (medications) prescription.medications = medications;
    if (notes !== undefined) prescription.notes = notes;
    if (followUpDate !== undefined) prescription.followUpDate = followUpDate;

    await prescription.save();

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete prescription
 * @route DELETE /api/prescriptions/:id
 * @access Private (Dermatologists only)
 */
export const deletePrescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return next(new AppError('Prescription not found', 404));
    }

    // Check if user is authorized to delete this prescription
    if (
      req.user.role === UserRole.DERMATOLOGIST &&
      prescription.dermatologist.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to delete this prescription', 403));
    }

    // Remove prescription from patient's prescriptions
    await Patient.findByIdAndUpdate(prescription.patient, {
      $pull: { prescriptions: prescription._id },
    });

    await prescription.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate PDF for prescription
 * @route GET /api/prescriptions/:id/pdf
 * @access Private
 */
export const generatePrescriptionPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber dateOfBirth gender')
      .populate('dermatologist', 'firstName lastName email');

    if (!prescription) {
      return next(new AppError('Prescription not found', 404));
    }

    // Check if user has access to this prescription
    if (
      req.user.role === UserRole.DERMATOLOGIST &&
      prescription.dermatologist._id.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to access this prescription', 403));
    }

    // Cast to populated prescription type
    const populatedPrescription = prescription as unknown as PopulatedPrescription;

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=prescription-${populatedPrescription._id}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add logo
    const logoPath = path.join(__dirname, '../../uploads/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
    }

    // Add content to the PDF
    doc
      .fontSize(16)
      .text('PRESCRIPTION', 200, 45, { align: 'right' })
      .fontSize(12)
      .text('Pakistan\'s Premier Dermatology Solution', 200, 70, { align: 'right' })
      .moveDown();

    // Add prescription details
    doc
      .fontSize(12)
      .text(`Prescription ID: ${populatedPrescription._id}`)
      .text(`Date: ${new Date(populatedPrescription.date).toLocaleDateString()}`)
      .moveDown()
      .text(`Patient: ${populatedPrescription.patient.firstName} ${populatedPrescription.patient.lastName}`)
      .text(`Dermatologist: ${populatedPrescription.dermatologist.firstName} ${populatedPrescription.dermatologist.lastName}`)
      .moveDown()
      .text(`Diagnosis: ${populatedPrescription.diagnosis}`)
      .moveDown();

    // Add medications
    doc.fontSize(14).text('Medications:').moveDown();

    populatedPrescription.medications.forEach((medication, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${medication.name}`)
        .text(`   Dosage: ${medication.dosage}`)
        .text(`   Frequency: ${medication.frequency}`)
        .text(`   Duration: ${medication.duration}`)
        .text(`   Instructions: ${medication.instructions}`)
        .moveDown();
    });

    // Add notes if any
    if (populatedPrescription.notes) {
      doc.moveDown().text(`Notes: ${populatedPrescription.notes}`);
    }

    // Add follow-up date if any
    if (populatedPrescription.followUpDate) {
      doc
        .moveDown()
        .text(`Follow-up Date: ${new Date(populatedPrescription.followUpDate).toLocaleDateString()}`);
    }

    // Add footer
    doc
      .moveDown(2)
      .fontSize(10)
      .text('This is a computer-generated prescription and does not require a signature.', {
        align: 'center',
      });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};
