import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, changePassword } from '../controllers/auth.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Register validation
const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
  body('role').optional().isIn(['admin', 'receptionist', 'dermatologist']).withMessage('Invalid role'),
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Update profile validation
const updateProfileValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
];

// Routes
router.post('/login', validate(loginValidation), login);
router.post('/register', protect, authorize(UserRole.ADMIN), validate(registerValidation), register);
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateProfileValidation), updateProfile);
router.put('/change-password', protect, validate(changePasswordValidation), changePassword);

export default router;
