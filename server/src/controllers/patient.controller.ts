import { Request, Response, NextFunction } from 'express';
import Patient, { IMedicalHistory } from '../models/patient.model';
import { AppError } from '../middlewares/error.middleware';

/**
 * Get all patients
 * @route GET /api/patients
 * @access Private
 */
export const getPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single patient
 * @route GET /api/patients/:id
 * @access Private
 */
export const getPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('getPatient called with ID:', req.params.id);

    // Validate patient ID
    if (!req.params.id || req.params.id === 'undefined') {
      console.log('Invalid patient ID provided:', req.params.id);
      return next(new AppError('Invalid patient ID', 400));
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      console.log('Patient not found with ID:', req.params.id);
      return next(new AppError('Patient not found', 404));
    }

    console.log('Patient found:', patient.firstName, patient.lastName);

    // Get decrypted medical history and allergies
    const medicalHistory = patient.getMedicalHistory();
    const allergies = patient.getAllergies();

    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        medicalHistory,
        allergies,
        // TODO: Add visits, prescriptions, and billings when those models are implemented
        visits: [],
        prescriptions: [],
        billings: [],
      },
    });
  } catch (error) {
    console.error('Error in getPatient:', error);
    next(error);
  }
};

/**
 * Create new patient
 * @route POST /api/patients
 * @access Private
 */
export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      bloodType,
    } = req.body;

    // Check if patient with email already exists
    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return next(new AppError('Patient with this email already exists', 400));
    }

    // Create patient
    const patient = new Patient({
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      bloodType,
    });

    // Set encrypted medical history if provided
    if (medicalHistory) {
      patient.setMedicalHistory(medicalHistory);
    }

    // Set encrypted allergies if provided
    if (allergies) {
      patient.setAllergies(allergies);
    }

    await patient.save();

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient
 * @route PUT /api/patients/:id
 * @access Private
 */
export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      bloodType,
    } = req.body;

    // Find patient
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Update basic fields
    patient.firstName = firstName || patient.firstName;
    patient.lastName = lastName || patient.lastName;
    patient.phoneNumber = phoneNumber || patient.phoneNumber;
    patient.address = address || patient.address;
    patient.bloodType = bloodType || patient.bloodType;

    // Update emergency contact if provided
    if (emergencyContact) {
      patient.emergencyContact = {
        ...patient.emergencyContact,
        ...emergencyContact,
      };
    }

    // Update medical history if provided
    if (medicalHistory) {
      patient.setMedicalHistory(medicalHistory);
    }

    // Update allergies if provided
    if (allergies) {
      patient.setAllergies(allergies);
    }

    await patient.save();

    // Get decrypted medical history and allergies for response
    const updatedMedicalHistory = patient.getMedicalHistory();
    const updatedAllergies = patient.getAllergies();

    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        medicalHistory: updatedMedicalHistory,
        allergies: updatedAllergies,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete patient
 * @route DELETE /api/patients/:id
 * @access Private
 */
export const deletePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    await patient.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add medical history to patient
 * @route POST /api/patients/:id/medical-history
 * @access Private
 */
export const addMedicalHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { condition, diagnosis, notes, diagnosedAt } = req.body;

    // Find patient
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Get current medical history
    const medicalHistory = patient.getMedicalHistory();

    // Add new entry
    const newEntry: IMedicalHistory = {
      condition,
      diagnosis,
      notes,
      diagnosedAt: new Date(diagnosedAt),
    };

    medicalHistory.push(newEntry);

    // Update medical history
    patient.setMedicalHistory(medicalHistory);
    await patient.save();

    res.status(200).json({
      success: true,
      data: {
        medicalHistory: patient.getMedicalHistory(),
      },
    });
  } catch (error) {
    next(error);
  }
};
