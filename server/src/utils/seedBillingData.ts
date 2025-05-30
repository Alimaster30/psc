import mongoose from 'mongoose';
import Billing, { PaymentStatus, PaymentMethod } from '../models/billing.model';
import Patient from '../models/patient.model';
import User from '../models/user.model';
import connectDB from '../config/db';

// Function to generate a random date within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Function to generate a random invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNum}`;
};

// Function to seed billing data
const seedBillingData = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to MongoDB for seeding billing data');

    // Check if there are already billing records
    const billingCount = await Billing.countDocuments();
    if (billingCount > 0) {
      console.log(`Database already has ${billingCount} billing records. Skipping seeding.`);
      return;
    }

    // Get all patients
    const patients = await Patient.find();
    if (patients.length === 0) {
      console.log('No patients found. Please seed patients first.');
      return;
    }

    // Get an admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Common services offered at the clinic
    const services = [
      { name: 'Initial Consultation', unitPrice: 2000 },
      { name: 'Follow-up Consultation', unitPrice: 1500 },
      { name: 'Skin Biopsy', unitPrice: 5000 },
      { name: 'Acne Treatment', unitPrice: 3000 },
      { name: 'Eczema Treatment', unitPrice: 2500 },
      { name: 'Psoriasis Treatment', unitPrice: 4000 },
      { name: 'Mole Removal', unitPrice: 6000 },
      { name: 'Wart Removal', unitPrice: 3500 },
      { name: 'Laser Treatment', unitPrice: 8000 },
      { name: 'Chemical Peel', unitPrice: 7000 },
    ];

    // Create billing records for each patient
    const billingRecords = [];

    // Current year
    const currentYear = new Date().getFullYear();

    // Create billing records for each month of the current year
    for (let month = 0; month < 12; month++) {
      // Create 3-5 billing records per month
      const recordsPerMonth = Math.floor(3 + Math.random() * 3);

      for (let i = 0; i < recordsPerMonth; i++) {
        // Select a random patient
        const patient = patients[Math.floor(Math.random() * patients.length)];

        // Generate a date within the current month
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0);
        const date = randomDate(startDate, endDate);

        // Due date is 15 days after the billing date
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + 15);

        // Select 1-3 random services
        const numServices = Math.floor(1 + Math.random() * 3);
        const selectedServices = [];

        let subtotal = 0;

        for (let j = 0; j < numServices; j++) {
          const service = services[Math.floor(Math.random() * services.length)];
          const quantity = Math.floor(1 + Math.random() * 2); // 1 or 2 quantity
          const totalPrice = service.unitPrice * quantity;

          selectedServices.push({
            name: service.name,
            description: `Standard ${service.name.toLowerCase()}`,
            quantity,
            unitPrice: service.unitPrice,
            totalPrice
          });

          subtotal += totalPrice;
        }

        // Calculate tax (5%)
        const tax = Math.round(subtotal * 0.05);

        // Calculate discount (0-10%)
        const discountPercent = Math.floor(Math.random() * 11);
        const discount = Math.round(subtotal * (discountPercent / 100));

        // Calculate total
        const total = subtotal + tax - discount;

        // Determine payment status and amount paid
        let paymentStatus: PaymentStatus;
        let amountPaid: number;
        let paymentDate: Date | undefined;
        let paymentMethod: PaymentMethod | undefined;

        const paymentRandom = Math.random();

        if (paymentRandom < 0.7) {
          // 70% chance of being fully paid
          paymentStatus = PaymentStatus.PAID;
          amountPaid = total;
          paymentDate = new Date(date);
          paymentDate.setDate(date.getDate() + Math.floor(Math.random() * 10)); // Paid within 10 days

          // Select a random payment method
          const paymentMethods = Object.values(PaymentMethod);
          paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        } else if (paymentRandom < 0.85) {
          // 15% chance of being partially paid
          paymentStatus = PaymentStatus.PARTIALLY_PAID;
          amountPaid = Math.round(total * (0.3 + Math.random() * 0.4)); // 30-70% paid
          paymentDate = new Date(date);
          paymentDate.setDate(date.getDate() + Math.floor(Math.random() * 10)); // Paid within 10 days

          // Select a random payment method
          const paymentMethods = Object.values(PaymentMethod);
          paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        } else if (date < new Date() && date.getTime() + 15 * 24 * 60 * 60 * 1000 < Date.now()) {
          // If the due date has passed, mark as overdue
          paymentStatus = PaymentStatus.OVERDUE;
          amountPaid = 0;
        } else {
          // Otherwise, mark as pending
          paymentStatus = PaymentStatus.PENDING;
          amountPaid = 0;
        }

        // Calculate balance
        const balance = total - amountPaid;

        // Create the billing record
        billingRecords.push({
          patient: patient._id,
          invoiceNumber: generateInvoiceNumber(),
          date,
          dueDate,
          services: selectedServices,
          subtotal,
          tax,
          discount,
          total,
          amountPaid,
          balance,
          paymentStatus,
          paymentMethod,
          paymentDate,
          notes: 'Generated as test data',
          createdBy: adminUser._id
        });
      }
    }

    // Insert all billing records
    await Billing.insertMany(billingRecords);

    console.log(`Successfully seeded ${billingRecords.length} billing records`);
  } catch (error) {
    console.error('Error seeding billing data:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedBillingData();
}

export default seedBillingData;
