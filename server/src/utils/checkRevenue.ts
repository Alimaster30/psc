import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Billing from '../models/billing.model';
import Patient from '../models/patient.model';
import connectDB from '../config/db';

dotenv.config();

// Connect to MongoDB
connectDB();

// Function to check current revenue
const checkRevenue = async () => {
  try {
    console.log('📊 Checking Current Revenue Data...\n');

    const today = new Date();

    // Get current month's first and last day
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    // Get total revenue
    const totalRevenue = await Billing.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' },
        },
      },
    ]);

    // Get current month revenue
    const monthlyRevenue = await Billing.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' },
        },
      },
    ]);

    // Get current month billing breakdown
    const monthlyBreakdown = await Billing.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth,
          },
        },
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          paidAmount: { $sum: '$amountPaid' },
        },
      },
    ]);

    // Get all billing records for current month
    const currentMonthBills = await Billing.find({
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      },
    }).sort({ date: -1 });

    // Display results
    console.log('🏥 PAK SKIN CARE - REVENUE REPORT');
    console.log('='.repeat(50));
    console.log(`📅 Report Date: ${today.toLocaleDateString()}`);
    console.log(`📅 Current Month: ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    console.log('='.repeat(50));

    console.log('\n💰 REVENUE SUMMARY:');
    console.log(`Total Revenue (All Time): ₨${(totalRevenue[0]?.total || 0).toLocaleString()}`);
    console.log(`Current Month Revenue: ₨${(monthlyRevenue[0]?.total || 0).toLocaleString()}`);

    console.log('\n📊 CURRENT MONTH BREAKDOWN:');
    monthlyBreakdown.forEach(item => {
      console.log(`${item._id.toUpperCase()}: ${item.count} bills | Total: ₨${item.totalAmount.toLocaleString()} | Paid: ₨${item.paidAmount.toLocaleString()}`);
    });

    console.log('\n📋 CURRENT MONTH BILLING DETAILS:');
    if (currentMonthBills.length > 0) {
      currentMonthBills.forEach(bill => {
        console.log(`${bill.invoiceNumber} | ₨${bill.total.toLocaleString()} | Paid: ₨${bill.amountPaid.toLocaleString()} | Status: ${bill.paymentStatus} | Date: ${bill.date.toLocaleDateString()}`);
      });
    } else {
      console.log('No billing records found for current month.');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Revenue check completed successfully!');

  } catch (error) {
    console.error('❌ Error checking revenue:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the check function
checkRevenue();
