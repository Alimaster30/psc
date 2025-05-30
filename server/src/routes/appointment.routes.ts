import express from 'express';
import { body } from 'express-validator';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getAvailableTimes,
} from '../controllers/appointment.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/user.model';
import { AppointmentStatus } from '../models/appointment.model';

const router = express.Router();

// Appointment validation
const appointmentValidation = [
  body('patient').isMongoId().withMessage('Please provide a valid patient ID'),
  body('dermatologist').isMongoId().withMessage('Please provide a valid dermatologist ID'),
  body('service').isMongoId().withMessage('Please provide a valid service ID'),
  body('date').isISO8601().toDate().withMessage('Please provide a valid date'),
  body('startTime').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/).withMessage('Start time must be in HH:MM AM/PM format'),
  body('endTime').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/).withMessage('End time must be in HH:MM AM/PM format'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('status')
    .optional()
    .isIn(Object.values(AppointmentStatus))
    .withMessage('Invalid status'),
];

// Status update validation
const statusValidation = [
  body('status')
    .isIn(Object.values(AppointmentStatus))
    .withMessage('Invalid status'),
];

// Apply middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getAppointments)
  .post(validate(appointmentValidation), createAppointment); // Allow all authenticated users to create appointments

// Get available times
router.get('/available-times', getAvailableTimes);

router.route('/:id')
  .get(getAppointment)
  .put(validate(appointmentValidation.map(validation => validation.optional())), updateAppointment)
  .delete(deleteAppointment);

router.patch('/:id/status', validate(statusValidation), updateAppointmentStatus);

export default router;
