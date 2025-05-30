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

// Routes (Admin only)
router.get('/patient-growth', authorize(UserRole.ADMIN), getPatientGrowth);
router.get('/revenue', authorize(UserRole.ADMIN), getRevenue);
router.get('/appointments', authorize(UserRole.ADMIN), getAppointmentAnalytics);
router.get('/top-medications', authorize(UserRole.ADMIN), getTopMedications);
router.get('/dashboard-summary', authorize(UserRole.ADMIN), getDashboardSummary);

export default router;
