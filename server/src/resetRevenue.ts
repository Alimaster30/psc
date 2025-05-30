/**
 * Reset Revenue Script
 *
 * This script resets the revenue data in the database by:
 * 1. Setting all existing billing amounts to 0
 * 2. Creating a new billing record for the current month with a small amount
 *
 * Run this script with: npx ts-node src/resetRevenue.ts
 */

import mongoose from 'mongoose';
import Billing, { PaymentMethod, PaymentStatus } from './models/billing.model';
import dotenv from 'dotenv';
import { DEPLOYMENT_DATE } from './config/deployment';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pak-skin-care')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const resetRevenue = async () => {
  try {
    console.log('Starting revenue reset process...');

    // 1. Get count of billing records
    const billingCount = await Billing.countDocuments();
    console.log(`Found ${billingCount} billing records`);

    // 2. Update all billing records to set amountPaid to 0
    const updateResult = await Billing.updateMany(
      {}, // Match all records
      { $set: { amountPaid: 0 } } // Set amountPaid to 0
    );

    console.log(`Updated ${updateResult.modifiedCount} billing records to zero amount`);

    // 3. Create a new billing record for the current month with a small amount (4,060)
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

    // Get a valid patient ID from the database
    const patients = await mongoose.connection.db.collection('patients').find({}).limit(1).toArray();
    if (patients.length === 0) {
      throw new Error('No patients found in the database');
    }
    const patientId = patients[0]._id;

    // Get a valid user ID from the database (for createdBy field)
    const users = await mongoose.connection.db.collection('users').find({}).limit(1).toArray();
    if (users.length === 0) {
      throw new Error('No users found in the database');
    }
    const userId = users[0]._id;

    // Generate a unique invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const newBilling = new Billing({
      patient: patientId,
      invoiceNumber: invoiceNumber,
      date: today,
      dueDate: dueDate,
      services: [
        {
          name: 'Monthly Revenue Reset',
          description: 'Revenue reset for deployment',
          quantity: 1,
          unitPrice: 4060,
          totalPrice: 4060
        }
      ],
      subtotal: 4060,
      tax: 0,
      discount: 0,
      total: 4060,
      amountPaid: 4060,
      balance: 0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CASH,
      paymentDate: today,
      notes: 'Revenue reset for deployment',
      createdBy: userId
    });

    await newBilling.save();
    console.log('Created new billing record with amount 4,060');

    // 4. Verify the reset
    const totalRevenue = await Billing.aggregate([
      {
        $match: {
          date: { $gte: DEPLOYMENT_DATE }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' }
        }
      }
    ]);

    console.log('New total revenue:', totalRevenue.length > 0 ? totalRevenue[0].total : 0);

    console.log('Revenue reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting revenue:', error);
    process.exit(1);
  }
};

// Run the reset function
resetRevenue();
