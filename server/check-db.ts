import mongoose from 'mongoose';
import Patient from './src/models/patient.model';
import Appointment from './src/models/appointment.model';
import Prescription from './src/models/prescription.model';
import Billing from './src/models/billing.model';
import User from './src/models/user.model';

console.log('Starting database check...');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pakskincare');
    console.log('Connected to MongoDB');

    const patientCount = await Patient.countDocuments();
    console.log(`Patient count: ${patientCount}`);

    const appointmentCount = await Appointment.countDocuments();
    console.log(`Appointment count: ${appointmentCount}`);

    const prescriptionCount = await Prescription.countDocuments();
    console.log(`Prescription count: ${prescriptionCount}`);

    const billingCount = await Billing.countDocuments();
    console.log(`Billing count: ${billingCount}`);

    const userCount = await User.countDocuments();
    console.log(`User count: ${userCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
