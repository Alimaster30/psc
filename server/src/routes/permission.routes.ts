import express from 'express';
import {
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  getRolePermission,
  checkPermission,
  initializePermissions,
} from '../controllers/permission.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all permissions (Admin only)
router.get('/', authorize(UserRole.ADMIN), getPermissions);

// Initialize default permissions (Admin only)
router.post('/initialize', authorize(UserRole.ADMIN), initializePermissions);

// Role permission routes
router.get('/roles', authorize(UserRole.ADMIN), getRolePermissions);
router.put('/roles', authorize(UserRole.ADMIN), updateRolePermissions);
router.get('/roles/:role', authorize(UserRole.ADMIN), getRolePermission);

// Check permission for current user
router.get('/check/:permission', checkPermission);

export default router;
