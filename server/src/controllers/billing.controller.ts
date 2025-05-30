import { Request, Response, NextFunction } from 'express';
import Billing, { PaymentStatus, PaymentMethod, IServiceItem } from '../models/billing.model';
import Patient from '../models/patient.model';
import { UserRole } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Add type declaration for populated billing
interface PopulatedBilling {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  createdBy: {
    firstName: string;
    lastName: string;
  };
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  services: IServiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  notes?: string;
}

/**
 * Get all billings
 * @route GET /api/billings
 * @access Private
 */
export const getBillings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient, status, startDate, endDate } = req.query;
    const filter: any = {};

    // Apply filters if provided
    if (patient) {
      filter.patient = patient;
    }

    if (status) {
      filter.paymentStatus = status;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate as string) };
    }

    const billings = await Billing.find(filter)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('appointment', 'date startTime endTime')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: billings.length,
      data: billings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single billing
 * @route GET /api/billings/:id
 * @access Private
 */
export const getBilling = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber dateOfBirth gender')
      .populate('appointment', 'date startTime endTime reason')
      .populate('createdBy', 'firstName lastName');

    if (!billing) {
      return next(new AppError('Billing not found', 404));
    }

    res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new billing
 * @route POST /api/billings
 * @access Private (Receptionists and Admins only)
 */
export const createBilling = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      patient,
      appointment,
      services,
      subtotal,
      tax,
      discount,
      total,
      amountPaid,
      paymentStatus,
      paymentMethod,
      paymentDate,
      notes,
    } = req.body;

    // Check if user is authorized to create billings
    if (
      req.user.role !== UserRole.RECEPTIONIST &&
      req.user.role !== UserRole.ADMIN
    ) {
      return next(new AppError('Not authorized to create billings', 403));
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Set due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create billing
    const billing = await Billing.create({
      patient,
      appointment,
      invoiceNumber,
      date: new Date(),
      dueDate,
      services,
      subtotal,
      tax: tax || 0,
      discount: discount || 0,
      total,
      amountPaid: amountPaid || 0,
      balance: total - (amountPaid || 0),
      paymentStatus: paymentStatus || PaymentStatus.PENDING,
      paymentMethod,
      paymentDate,
      notes,
      createdBy: req.user.id,
    });

    // Add billing to patient's billings
    await Patient.findByIdAndUpdate(patient, {
      $push: { billings: billing._id },
    });

    res.status(201).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update billing
 * @route PUT /api/billings/:id
 * @access Private (Receptionists and Admins only)
 */
export const updateBilling = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      services,
      subtotal,
      tax,
      discount,
      total,
      amountPaid,
      paymentStatus,
      paymentMethod,
      paymentDate,
      notes,
    } = req.body;

    // Find billing
    const billing = await Billing.findById(req.params.id);
    if (!billing) {
      return next(new AppError('Billing not found', 404));
    }

    // Check if user is authorized to update billings
    if (
      req.user.role !== UserRole.RECEPTIONIST &&
      req.user.role !== UserRole.ADMIN
    ) {
      return next(new AppError('Not authorized to update billings', 403));
    }

    // Update fields
    if (services) billing.services = services;
    if (subtotal !== undefined) billing.subtotal = subtotal;
    if (tax !== undefined) billing.tax = tax;
    if (discount !== undefined) billing.discount = discount;
    if (total !== undefined) billing.total = total;
    if (amountPaid !== undefined) {
      billing.amountPaid = amountPaid;
      billing.balance = billing.total - amountPaid;

      // Update payment status based on amount paid
      if (amountPaid >= billing.total) {
        billing.paymentStatus = PaymentStatus.PAID;
      } else if (amountPaid > 0) {
        billing.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      }
    }
    if (paymentStatus) billing.paymentStatus = paymentStatus;
    if (paymentMethod) billing.paymentMethod = paymentMethod;
    if (paymentDate) billing.paymentDate = paymentDate;
    if (notes !== undefined) billing.notes = notes;

    await billing.save();

    res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete billing
 * @route DELETE /api/billings/:id
 * @access Private (Admins only)
 */
export const deleteBilling = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return next(new AppError('Billing not found', 404));
    }

    // Check if user is authorized to delete billings
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to delete billings', 403));
    }

    // Remove billing from patient's billings
    await Patient.findByIdAndUpdate(billing.patient, {
      $pull: { billings: billing._id },
    });

    await billing.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate PDF for invoice
 * @route GET /api/billings/:id/pdf
 * @access Private
 */
export const generateInvoicePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber address')
      .populate('createdBy', 'firstName lastName');

    if (!billing) {
      return next(new AppError('Billing not found', 404));
    }

    // Cast to populated billing type
    const populatedBilling = billing as unknown as PopulatedBilling;

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${populatedBilling.invoiceNumber}.pdf`
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
      .text('INVOICE', 200, 45, { align: 'right' })
      .fontSize(12)
      .text('Pakistan\'s Premier Dermatology Solution', 200, 70, { align: 'right' })
      .moveDown();

    // Add invoice details
    doc
      .fontSize(12)
      .text(`Invoice Number: ${populatedBilling.invoiceNumber}`)
      .text(`Date: ${new Date(populatedBilling.date).toLocaleDateString()}`)
      .text(`Due Date: ${new Date(populatedBilling.dueDate).toLocaleDateString()}`)
      .moveDown()
      .text(`Patient: ${populatedBilling.patient.firstName} ${populatedBilling.patient.lastName}`)
      .text(`Address: ${populatedBilling.patient.address}`)
      .text(`Email: ${populatedBilling.patient.email}`)
      .text(`Phone: ${populatedBilling.patient.phoneNumber}`)
      .moveDown();

    // Add services table
    doc.fontSize(14).text('Services:').moveDown();

    // Table header
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [200, 80, 80, 80];

    doc
      .fontSize(10)
      .text('Description', tableLeft, tableTop)
      .text('Quantity', tableLeft + colWidths[0], tableTop)
      .text('Unit Price', tableLeft + colWidths[0] + colWidths[1], tableTop)
      .text('Total', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);

    // Draw a line
    doc
      .moveTo(tableLeft, tableTop + 15)
      .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop + 15)
      .stroke();

    // Table rows
    let rowTop = tableTop + 25;
    populatedBilling.services.forEach((service) => {
      doc
        .fontSize(10)
        .text(service.name, tableLeft, rowTop)
        .text(service.quantity.toString(), tableLeft + colWidths[0], rowTop)
        .text(`$${service.unitPrice.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1], rowTop)
        .text(`$${service.totalPrice.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);

      rowTop += 20;
    });

    // Draw a line
    doc
      .moveTo(tableLeft, rowTop)
      .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowTop)
      .stroke();

    // Add totals
    rowTop += 10;
    doc
      .fontSize(10)
      .text('Subtotal:', tableLeft + colWidths[0] + colWidths[1], rowTop)
      .text(`$${populatedBilling.subtotal.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);

    rowTop += 15;
    doc
      .text('Tax:', tableLeft + colWidths[0] + colWidths[1], rowTop)
      .text(`$${populatedBilling.tax.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);

    rowTop += 15;
    doc
      .text('Discount:', tableLeft + colWidths[0] + colWidths[1], rowTop)
      .text(`$${populatedBilling.discount.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);

    rowTop += 15;
    doc
      .fontSize(12)
      .text('Total:', tableLeft + colWidths[0] + colWidths[1], rowTop)
      .text(`$${populatedBilling.total.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);

    rowTop += 20;
    doc
      .fontSize(10)
      .text('Amount Paid:', tableLeft + colWidths[0] + colWidths[1], rowTop)
      .text(`$${populatedBilling.amountPaid.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);

    rowTop += 15;
    doc
      .fontSize(12)
      .text('Balance Due:', tableLeft + colWidths[0] + colWidths[1], rowTop)
      .text(`$${populatedBilling.balance.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);

    // Add payment status
    rowTop += 25;
    doc
      .fontSize(12)
      .text(`Payment Status: ${populatedBilling.paymentStatus}`, tableLeft);

    if (populatedBilling.paymentMethod) {
      doc.text(`Payment Method: ${populatedBilling.paymentMethod}`);
    }

    if (populatedBilling.paymentDate) {
      doc.text(`Payment Date: ${new Date(populatedBilling.paymentDate).toLocaleDateString()}`);
    }

    // Add notes if any
    if (populatedBilling.notes) {
      doc.moveDown().text(`Notes: ${populatedBilling.notes}`);
    }

    // Add footer
    doc
      .moveDown(2)
      .fontSize(10)
      .text('Thank you for your business!', { align: 'center' })
      .moveDown()
      .text(`Generated by: ${populatedBilling.createdBy.firstName} ${populatedBilling.createdBy.lastName}`, {
        align: 'center',
      });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};
