import express from 'express';
import {
  getPatientGrowth,
  getRevenue,
  getAppointmentAnalytics,
  getTopMedications,
  getDashboardSummary,
} from '../controllers/analytics.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(authorize(UserRole.ADMIN));

// Routes
router.get('/patient-growth', getPatientGrowth);
router.get('/revenue', getRevenue);
router.get('/appointments', getAppointmentAnalytics);
router.get('/top-medications', getTopMedications);
router.get('/dashboard-summary', getDashboardSummary);

export default router;
