import express from 'express';
import { body } from 'express-validator';
import {
  getBillings,
  getBilling,
  createBilling,
  updateBilling,
  deleteBilling,
  generateInvoicePDF,
} from '../controllers/billing.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../models/user.model';
import { PaymentStatus, PaymentMethod } from '../models/billing.model';

const router = express.Router();

// Service item validation
const serviceItemValidation = [
  body('services.*.name').notEmpty().withMessage('Service name is required'),
  body('services.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('services.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price cannot be negative'),
  body('services.*.totalPrice').isFloat({ min: 0 }).withMessage('Total price cannot be negative'),
];

// Billing validation
const billingValidation = [
  body('patient').isMongoId().withMessage('Please provide a valid patient ID'),
  body('appointment').optional().isMongoId().withMessage('Please provide a valid appointment ID'),
  ...serviceItemValidation,
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal cannot be negative'),
  body('tax').optional().isFloat({ min: 0 }).withMessage('Tax cannot be negative'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Discount cannot be negative'),
  body('total').isFloat({ min: 0 }).withMessage('Total cannot be negative'),
  body('amountPaid').optional().isFloat({ min: 0 }).withMessage('Amount paid cannot be negative'),
  body('paymentStatus')
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage('Invalid payment status'),
  body('paymentMethod')
    .optional()
    .isIn(Object.values(PaymentMethod))
    .withMessage('Invalid payment method'),
  body('paymentDate').optional().isISO8601().toDate().withMessage('Please provide a valid payment date'),
];

// Apply middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getBillings)
  .post(
    authorize(UserRole.RECEPTIONIST, UserRole.ADMIN),
    validate(billingValidation),
    createBilling
  );

router.route('/:id')
  .get(getBilling)
  .put(
    authorize(UserRole.RECEPTIONIST, UserRole.ADMIN),
    validate([
      ...serviceItemValidation.map(validation => validation.optional()),
      body('subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal cannot be negative'),
      body('tax').optional().isFloat({ min: 0 }).withMessage('Tax cannot be negative'),
      body('discount').optional().isFloat({ min: 0 }).withMessage('Discount cannot be negative'),
      body('total').optional().isFloat({ min: 0 }).withMessage('Total cannot be negative'),
      body('amountPaid').optional().isFloat({ min: 0 }).withMessage('Amount paid cannot be negative'),
      body('paymentStatus')
        .optional()
        .isIn(Object.values(PaymentStatus))
        .withMessage('Invalid payment status'),
      body('paymentMethod')
        .optional()
        .isIn(Object.values(PaymentMethod))
        .withMessage('Invalid payment method'),
      body('paymentDate').optional().isISO8601().toDate().withMessage('Please provide a valid payment date'),
    ]),
    updateBilling
  )
  .delete(authorize(UserRole.ADMIN), deleteBilling);

router.get('/:id/pdf', generateInvoicePDF);

export default router;
