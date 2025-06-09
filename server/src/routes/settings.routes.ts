import express from 'express';
import { getSettings, updateSettings, resetSettings } from '../controllers/settings.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize(UserRole.ADMIN));

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/reset', resetSettings);

export default router;