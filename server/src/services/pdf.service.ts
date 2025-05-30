import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IBilling } from '../models/billing.model';
import { IPrescription } from '../models/prescription.model';
import { IPatient } from '../models/patient.model';
import { IUser } from '../models/user.model';
import { ISettings } from '../models/settings.model';

/**
 * PDF Service for generating PDF documents
 * Provides a consistent approach for PDF generation across the application
 */
export class PDFService {
  /**
   * Generate a PDF invoice for a billing record
   * @param billing The billing record
   * @param settings The clinic settings
   * @param outputPath The path to save the PDF
   * @returns Promise<string> The path to the generated PDF
   */
  static async generateInvoice(
    billing: IBilling,
    settings: ISettings,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);

        writeStream.on('finish', () => {
          resolve(outputPath);
        });

        doc.pipe(writeStream);

        // Add clinic logo - try settings logo first, then fallback to default logo
        let logoAdded = false;
        if (settings.logo) {
          const logoPath = path.join(__dirname, '../../uploads', settings.logo);
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 100 });
            logoAdded = true;
          }
        }

        // Fallback to default logo if no custom logo is set
        if (!logoAdded) {
          const defaultLogoPath = path.join(__dirname, '../../uploads/logo.png');
          if (fs.existsSync(defaultLogoPath)) {
            doc.image(defaultLogoPath, 50, 45, { width: 100 });
          }
        }

        // Add clinic information
        doc.fontSize(10)
          .text(`${settings.address || ''}`, 200, 65, { align: 'right' })
          .text(`Phone: ${settings.phoneNumber || ''}`, 200, 80, { align: 'right' })
          .text(`Email: ${settings.email || ''}`, 200, 95, { align: 'right' })
          .text(`Website: ${settings.website || ''}`, 200, 110, { align: 'right' });

        // Add invoice title and information
        doc.fontSize(16).text('INVOICE', 50, 160);
        doc.fontSize(10)
          .text(`Invoice Number: ${billing.invoiceNumber}`, 50, 185)
          .text(`Date: ${new Date(billing.date).toLocaleDateString()}`, 50, 200)
          .text(`Due Date: ${new Date(billing.dueDate).toLocaleDateString()}`, 50, 215);

        // Add patient information
        const patient = billing.patient as unknown as IPatient;
        doc.fontSize(10)
          .text('Bill To:', 300, 185)
          .text(`${patient.firstName} ${patient.lastName}`, 300, 200)
          .text(`${patient.address}`, 300, 215)
          .text(`Phone: ${patient.phoneNumber}`, 300, 230)
          .text(`Email: ${patient.email}`, 300, 245);

        // Add table headers
        doc.moveTo(50, 280)
          .lineTo(550, 280)
          .stroke();

        doc.fontSize(10)
          .text('Description', 50, 290)
          .text('Qty', 300, 290, { width: 50, align: 'center' })
          .text('Unit Price', 350, 290, { width: 100, align: 'center' })
          .text('Amount', 450, 290, { width: 100, align: 'right' });

        doc.moveTo(50, 305)
          .lineTo(550, 305)
          .stroke();

        // Add services
        let y = 320;
        billing.services.forEach(service => {
          doc.fontSize(10)
            .text(service.name, 50, y)
            .text(service.quantity.toString(), 300, y, { width: 50, align: 'center' })
            .text(`${service.unitPrice.toFixed(2)} ${billing.currency || 'PKR'}`, 350, y, { width: 100, align: 'center' })
            .text(`${service.totalPrice.toFixed(2)} ${billing.currency || 'PKR'}`, 450, y, { width: 100, align: 'right' });

          y += 20;
        });

        // Add totals
        doc.moveTo(50, y)
          .lineTo(550, y)
          .stroke();

        y += 15;
        doc.fontSize(10)
          .text('Subtotal:', 350, y)
          .text(`${billing.subtotal.toFixed(2)} ${billing.currency || 'PKR'}`, 450, y, { width: 100, align: 'right' });

        y += 15;
        doc.fontSize(10)
          .text('Tax:', 350, y)
          .text(`${billing.tax.toFixed(2)} ${billing.currency || 'PKR'}`, 450, y, { width: 100, align: 'right' });

        y += 15;
        doc.fontSize(10)
          .text('Discount:', 350, y)
          .text(`${billing.discount.toFixed(2)} ${billing.currency || 'PKR'}`, 450, y, { width: 100, align: 'right' });

        y += 15;
        doc.fontSize(12)
          .text('Total:', 350, y)
          .text(`${billing.total.toFixed(2)} ${billing.currency || 'PKR'}`, 450, y, { width: 100, align: 'right' });

        y += 15;
        doc.fontSize(10)
          .text('Amount Paid:', 350, y)
          .text(`${billing.amountPaid.toFixed(2)} ${billing.currency || 'PKR'}`, 450, y, { width: 100, align: 'right' });

        y += 15;
        doc.fontSize(10)
          .text('Balance Due:', 350, y)
          .text(`${billing.balance.toFixed(2)} ${billing.currency || 'PKR'}`, 450, y, { width: 100, align: 'right' });

        // Add payment information
        y += 30;
        doc.fontSize(10)
          .text('Payment Status:', 50, y)
          .text(billing.paymentStatus.replace('_', ' ').toUpperCase(), 150, y);

        if (billing.paymentMethod) {
          y += 15;
          doc.fontSize(10)
            .text('Payment Method:', 50, y)
            .text(billing.paymentMethod.replace('_', ' ').toUpperCase(), 150, y);
        }

        if (billing.paymentDate) {
          y += 15;
          doc.fontSize(10)
            .text('Payment Date:', 50, y)
            .text(new Date(billing.paymentDate).toLocaleDateString(), 150, y);
        }

        // Add notes
        if (billing.notes) {
          y += 30;
          doc.fontSize(10)
            .text('Notes:', 50, y);

          y += 15;
          doc.fontSize(10)
            .text(billing.notes, 50, y);
        }

        // Add footer
        doc.fontSize(10)
          .text('Thank you for your business!', 50, 700, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a PDF prescription
   * @param prescription The prescription record
   * @param settings The clinic settings
   * @param outputPath The path to save the PDF
   * @returns Promise<string> The path to the generated PDF
   */
  static async generatePrescription(
    prescription: IPrescription,
    settings: ISettings,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(outputPath);

        writeStream.on('finish', () => {
          resolve(outputPath);
        });

        doc.pipe(writeStream);

        // Add clinic logo - try settings logo first, then fallback to default logo
        let logoAdded = false;
        if (settings.logo) {
          const logoPath = path.join(__dirname, '../../uploads', settings.logo);
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 100 });
            logoAdded = true;
          }
        }

        // Fallback to default logo if no custom logo is set
        if (!logoAdded) {
          const defaultLogoPath = path.join(__dirname, '../../uploads/logo.png');
          if (fs.existsSync(defaultLogoPath)) {
            doc.image(defaultLogoPath, 50, 45, { width: 100 });
          }
        }

        // Add clinic information
        doc.fontSize(20).text(`${settings.clinicName || 'Pak Skin Care'}`, 200, 45, { align: 'right' });
        doc.fontSize(10)
          .text(`${settings.address || ''}`, 200, 65, { align: 'right' })
          .text(`Phone: ${settings.phoneNumber || ''}`, 200, 80, { align: 'right' })
          .text(`Email: ${settings.email || ''}`, 200, 95, { align: 'right' })
          .text(`Website: ${settings.website || ''}`, 200, 110, { align: 'right' });

        // Add prescription title
        doc.fontSize(16).text('PRESCRIPTION', 50, 160);

        // Add prescription information
        doc.fontSize(10)
          .text(`Date: ${new Date(prescription.date).toLocaleDateString()}`, 50, 185);

        if (prescription.followUpDate) {
          doc.text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`, 50, 200);
        }

        // Add patient information
        const patient = prescription.patient as unknown as IPatient;
        doc.fontSize(10)
          .text('Patient:', 300, 185)
          .text(`${patient.firstName} ${patient.lastName}`, 300, 200)
          .text(`DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}`, 300, 215)
          .text(`Gender: ${patient.gender}`, 300, 230);

        // Add doctor information
        const doctor = prescription.dermatologist as unknown as IUser;
        doc.fontSize(10)
          .text('Prescribed By:', 50, 230)
          .text(`Dr. ${doctor.firstName} ${doctor.lastName}`, 50, 245);

        // Add diagnosis
        doc.fontSize(12).text('Diagnosis:', 50, 280);
        doc.fontSize(10).text(prescription.diagnosis, 50, 295);

        // Add medications
        doc.fontSize(12).text('Medications:', 50, 330);

        let y = 345;
        prescription.medications.forEach((medication, index) => {
          doc.fontSize(10)
            .text(`${index + 1}. ${medication.name}`, 50, y);

          y += 15;
          doc.fontSize(10)
            .text(`Dosage: ${medication.dosage}`, 70, y)
            .text(`Frequency: ${medication.frequency}`, 250, y);

          y += 15;
          doc.fontSize(10)
            .text(`Duration: ${medication.duration}`, 70, y);

          y += 15;
          doc.fontSize(10)
            .text(`Instructions: ${medication.instructions}`, 70, y);

          y += 25;
        });

        // Add notes
        if (prescription.notes) {
          doc.fontSize(12).text('Notes:', 50, y);
          y += 15;
          doc.fontSize(10).text(prescription.notes, 50, y);
        }

        // Add signature
        doc.fontSize(10)
          .text('Doctor\'s Signature:', 350, 650)
          .moveTo(350, 680)
          .lineTo(500, 680)
          .stroke();

        // Add footer
        doc.fontSize(10)
          .text('This prescription is valid for 30 days from the date of issue.', 50, 700, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
