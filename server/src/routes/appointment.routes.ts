import express from 'express';
import { body } from 'express-validator';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
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
  body('date').isISO8601().toDate().withMessage('Please provide a valid date'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM format'),
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
  .post(validate(appointmentValidation), createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(validate(appointmentValidation.map(validation => validation.optional())), updateAppointment)
  .delete(deleteAppointment);

router.patch('/:id/status', validate(statusValidation), updateAppointmentStatus);

export default router;
