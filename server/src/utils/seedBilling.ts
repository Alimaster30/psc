import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Billing, { PaymentStatus, PaymentMethod } from '../models/billing.model';
import Patient from '../models/patient.model';
import Appointment, { AppointmentStatus } from '../models/appointment.model';
import Service from '../models/service.model';
import User, { UserRole } from '../models/user.model';
import connectDB from '../config/db';

dotenv.config();

// Connect to MongoDB
connectDB();

// Function to generate random invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

// Function to get random date within a range
const getRandomDateInRange = (startDate: Date, endDate: Date): Date => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
};

// Function to seed billing data
const seedBilling = async () => {
  try {
    console.log('Starting billing seed process...');

    // Clear existing billing data
    await Billing.deleteMany({});
    console.log('Existing billing records deleted');

    // Get required data
    const patients = await Patient.find({});
    const completedAppointments = await Appointment.find({
      status: AppointmentStatus.COMPLETED
    }).populate('service patient');

    const services = await Service.find({});
    const receptionist = await User.findOne({ role: UserRole.RECEPTIONIST });

    if (!receptionist) {
      console.error('No receptionist found. Please run user seeding first.');
      return;
    }

    if (completedAppointments.length === 0) {
      console.log('No completed appointments found. Creating some completed appointments first...');

      // Update some appointments to completed status
      const scheduledAppointments = await Appointment.find({
        status: AppointmentStatus.SCHEDULED
      }).limit(15);

      for (const appointment of scheduledAppointments) {
        appointment.status = AppointmentStatus.COMPLETED;
        await appointment.save();
      }

      console.log(`Updated ${scheduledAppointments.length} appointments to completed status`);
    }

    // Get updated completed appointments
    const updatedCompletedAppointments = await Appointment.find({
      status: AppointmentStatus.COMPLETED
    }).populate('service patient');

    console.log(`Found ${updatedCompletedAppointments.length} completed appointments`);

    const billingRecords = [];
    const currentDate = new Date();

    // Create billing records for completed appointments
    for (const appointment of updatedCompletedAppointments) {
      const service = appointment.service as any;
      const patient = appointment.patient as any;

      if (!service || !patient) continue;

      // Generate billing date (within last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
      const billingDate = getRandomDateInRange(threeMonthsAgo, currentDate);

      // Set due date (30 days from billing date)
      const dueDate = new Date(billingDate);
      dueDate.setDate(dueDate.getDate() + 30);

      // Create service item
      const serviceItem = {
        name: service.name,
        description: service.description || '',
        quantity: 1,
        unitPrice: service.price,
        totalPrice: service.price
      };

      // Calculate totals
      const subtotal = service.price;
      const tax = Math.round(subtotal * 0.05); // 5% tax
      const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0; // 10% discount for 30% of bills
      const total = subtotal + tax - discount;

      // Determine payment status and amount paid
      let paymentStatus: PaymentStatus;
      let amountPaid: number;
      let paymentMethod: PaymentMethod | undefined;
      let paymentDate: Date | undefined;

      const randomPayment = Math.random();
      if (randomPayment < 0.7) {
        // 70% fully paid
        paymentStatus = PaymentStatus.PAID;
        amountPaid = total;
        paymentMethod = Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.CREDIT_CARD;
        paymentDate = new Date(billingDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Paid within 7 days
      } else if (randomPayment < 0.85) {
        // 15% partially paid
        paymentStatus = PaymentStatus.PARTIALLY_PAID;
        amountPaid = Math.round(total * (0.3 + Math.random() * 0.4)); // 30-70% paid
        paymentMethod = Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.DEBIT_CARD;
        paymentDate = new Date(billingDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000); // Paid within 14 days
      } else {
        // 15% pending
        paymentStatus = PaymentStatus.PENDING;
        amountPaid = 0;
      }

      const billingRecord = {
        patient: patient._id,
        appointment: appointment._id,
        invoiceNumber: generateInvoiceNumber(),
        date: billingDate,
        dueDate,
        services: [serviceItem],
        subtotal,
        tax,
        discount,
        total,
        amountPaid,
        balance: total - amountPaid,
        paymentStatus,
        paymentMethod,
        paymentDate,
        notes: discount > 0 ? 'Discount applied for loyal customer' : '',
        createdBy: receptionist._id
      };

      billingRecords.push(billingRecord);
    }

    // Add some additional billing records for patients without appointments
    const patientsWithoutBilling = patients.filter(patient =>
      !updatedCompletedAppointments.some(apt => apt.patient._id.toString() === patient._id.toString())
    );

    for (const patient of patientsWithoutBilling.slice(0, 5)) {
      // Create billing for consultation services
      const consultationServices = services.filter(s => s.category === 'Consultations');
      const randomService = consultationServices[Math.floor(Math.random() * consultationServices.length)];

      if (!randomService) continue;

      const billingDate = getRandomDateInRange(
        new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        currentDate
      );

      const dueDate = new Date(billingDate);
      dueDate.setDate(dueDate.getDate() + 30);

      const serviceItem = {
        name: randomService.name,
        description: randomService.description || '',
        quantity: 1,
        unitPrice: randomService.price,
        totalPrice: randomService.price
      };

      const subtotal = randomService.price;
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + tax;

      const billingRecord = {
        patient: patient._id,
        invoiceNumber: generateInvoiceNumber(),
        date: billingDate,
        dueDate,
        services: [serviceItem],
        subtotal,
        tax,
        discount: 0,
        total,
        amountPaid: total,
        balance: 0,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        paymentDate: new Date(billingDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000),
        notes: 'Walk-in consultation',
        createdBy: receptionist._id
      };

      billingRecords.push(billingRecord);
    }

    // Insert billing records
    if (billingRecords.length > 0) {
      await Billing.insertMany(billingRecords);
      console.log(`Created ${billingRecords.length} billing records`);

      // Calculate and display revenue summary
      const totalRevenue = billingRecords.reduce((sum, bill) => sum + bill.amountPaid, 0);
      const currentMonthRevenue = billingRecords
        .filter(bill => {
          const billDate = new Date(bill.date);
          return billDate.getMonth() === currentDate.getMonth() &&
                 billDate.getFullYear() === currentDate.getFullYear();
        })
        .reduce((sum, bill) => sum + bill.amountPaid, 0);

      console.log(`\n💰 Revenue Summary:`);
      console.log(`Total Revenue: ₨${totalRevenue.toLocaleString()}`);
      console.log(`Current Month Revenue: ₨${currentMonthRevenue.toLocaleString()}`);
      console.log(`Paid Bills: ${billingRecords.filter(b => b.paymentStatus === PaymentStatus.PAID).length}`);
      console.log(`Partially Paid: ${billingRecords.filter(b => b.paymentStatus === PaymentStatus.PARTIALLY_PAID).length}`);
      console.log(`Pending Bills: ${billingRecords.filter(b => b.paymentStatus === PaymentStatus.PENDING).length}`);
    }

    console.log('Billing seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding billing data:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedBilling();
