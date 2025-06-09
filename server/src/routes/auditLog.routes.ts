import express from 'express';
import {
  getAuditLogs,
  getAuditLogStats,
  getAuditLogById,
  exportAuditLogs,
} from '../controllers/auditLog.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Apply middleware to all routes - only admins can access audit logs
router.use(protect);
router.use(authorize(UserRole.ADMIN));

// Routes
router.get('/', getAuditLogs);
router.get('/stats', getAuditLogStats);
router.get('/export', exportAuditLogs);
router.get('/:id', getAuditLogById);

export default router;
