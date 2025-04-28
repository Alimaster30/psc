import express from 'express';
import { createBackup, getBackups, downloadBackup } from '../controllers/backup.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(authorize(UserRole.ADMIN));

// Routes
router.get('/', getBackups);
router.get('/create', createBackup);
router.get('/download/:backupId', downloadBackup);

export default router;
