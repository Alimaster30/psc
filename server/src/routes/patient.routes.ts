import express from 'express';
import { body } from 'express-validator';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  addMedicalHistory,
} from '../controllers/patient.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Patient validation
const patientValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').isISO8601().toDate().withMessage('Please provide a valid date of birth'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('address').notEmpty().withMessage('Address is required'),
  body('emergencyContact.name').notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContact.relationship').notEmpty().withMessage('Emergency contact relationship is required'),
  body('emergencyContact.phoneNumber').notEmpty().withMessage('Emergency contact phone number is required'),
];

// Medical history validation
const medicalHistoryValidation = [
  body('condition').notEmpty().withMessage('Condition is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('diagnosedAt').isISO8601().toDate().withMessage('Please provide a valid diagnosis date'),
];

// Apply middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getPatients)
  .post(validate(patientValidation), createPatient);

router.route('/:id')
  .get(getPatient)
  .put(validate(patientValidation.map(validation => validation.optional())), updatePatient)
  .delete(authorize(UserRole.ADMIN), deletePatient);

router.post('/:id/medical-history', 
  authorize(UserRole.DERMATOLOGIST, UserRole.ADMIN),
  validate(medicalHistoryValidation), 
  addMedicalHistory
);

export default router;
