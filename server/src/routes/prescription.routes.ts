import express from 'express';
import { body } from 'express-validator';
import {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  generatePrescriptionPDF,
} from '../controllers/prescription.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Medication validation
const medicationValidation = [
  body('medications.*.name').notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').notEmpty().withMessage('Dosage is required'),
  body('medications.*.frequency').notEmpty().withMessage('Frequency is required'),
  body('medications.*.duration').notEmpty().withMessage('Duration is required'),
  body('medications.*.instructions').notEmpty().withMessage('Instructions are required'),
];

// Prescription validation
const prescriptionValidation = [
  body('patient').isMongoId().withMessage('Please provide a valid patient ID'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  ...medicationValidation,
  body('followUpDate').optional().isISO8601().toDate().withMessage('Please provide a valid follow-up date'),
];

// Apply middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getPrescriptions)
  .post(
    authorize(UserRole.DERMATOLOGIST, UserRole.ADMIN),
    validate(prescriptionValidation),
    createPrescription
  );

router.route('/:id')
  .get(getPrescription)
  .put(
    authorize(UserRole.DERMATOLOGIST, UserRole.ADMIN),
    validate([
      body('diagnosis').optional().notEmpty().withMessage('Diagnosis is required'),
      ...medicationValidation.map(validation => validation.optional()),
      body('followUpDate').optional().isISO8601().toDate().withMessage('Please provide a valid follow-up date'),
    ]),
    updatePrescription
  )
  .delete(authorize(UserRole.DERMATOLOGIST, UserRole.ADMIN), deletePrescription);

router.get('/:id/pdf', generatePrescriptionPDF);

export default router;
