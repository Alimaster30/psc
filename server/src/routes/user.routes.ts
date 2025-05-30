import express from 'express';
import { body } from 'express-validator';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getUserDashboard
} from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// User creation validation
const userCreateValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
  body('phoneNumber')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10-15 digits'),
];

// User update validation
const userUpdateValidation = [
  body('firstName').optional().notEmpty().withMessage('First name is required'),
  body('lastName').optional().notEmpty().withMessage('Last name is required'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Apply middleware to all routes
router.use(protect);

// Dashboard data for the current user
router.get('/me/dashboard', getUserDashboard);

// Routes that require admin access
router.get('/', getUsers);
router.post('/', authorize(UserRole.ADMIN), validate(userCreateValidation), createUser);
router.route('/:id')
  .get(getUserById)
  .put(validate(userUpdateValidation), updateUser)
  .delete(authorize(UserRole.ADMIN), deleteUser);

// Status update route (Admin only)
router.patch('/:id/status', authorize(UserRole.ADMIN), updateUserStatus);

export default router;
