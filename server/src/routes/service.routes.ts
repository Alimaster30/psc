import express from 'express';
import {
  getAllServices,
  getServiceById,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
} from '../controllers/service.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.get('/category/:category', getServicesByCategory);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize(UserRole.ADMIN));

router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
