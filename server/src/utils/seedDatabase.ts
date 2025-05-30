import mongoose from 'mongoose';
import User, { UserRole } from '../models/user.model';
import Patient from '../models/patient.model';
import Appointment, { AppointmentStatus } from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import Service from '../models/service.model';
import connectDB from '../config/db';
import { hashPassword } from './auth';

// Sample data for patients
const patients = [
  {
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@example.com',
    phoneNumber: '+92 300 1234567',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'male',
    address: '123 Main Street, Islamabad, Pakistan',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Fatima Khan',
      relationship: 'Wife',
      phoneNumber: '+92 300 7654321'
    }
  },
  {
    firstName: 'Fatima',
    lastName: 'Ali',
    email: 'fatima.ali@example.com',
    phoneNumber: '+92 301 2345678',
    dateOfBirth: new Date('1990-08-21'),
    gender: 'female',
    address: '456 Park Avenue, Lahore, Pakistan',
    bloodType: 'A+',
    emergencyContact: {
      name: 'Ali Hassan',
      relationship: 'Husband',
      phoneNumber: '+92 301 8765432'
    }
  },
  {
    firstName: 'Muhammad',
    lastName: 'Raza',
    email: 'muhammad.raza@example.com',
    phoneNumber: '+92 302 3456789',
    dateOfBirth: new Date('1978-12-10'),
    gender: 'male',
    address: '789 Garden Road, Karachi, Pakistan',
    bloodType: 'B+',
    emergencyContact: {
      name: 'Aisha Raza',
      relationship: 'Daughter',
      phoneNumber: '+92 302 9876543'
    }
  },
  {
    firstName: 'Ayesha',
    lastName: 'Malik',
    email: 'ayesha.malik@example.com',
    phoneNumber: '+92 303 4567890',
    dateOfBirth: new Date('1995-03-25'),
    gender: 'female',
    address: '101 River View, Faisalabad, Pakistan',
    bloodType: 'AB-',
    emergencyContact: {
      name: 'Tariq Malik',
      relationship: 'Father',
      phoneNumber: '+92 303 0987654'
    }
  },
  {
    firstName: 'Imran',
    lastName: 'Ahmed',
    email: 'imran.ahmed@example.com',
    phoneNumber: '+92 304 5678901',
    dateOfBirth: new Date('1982-07-17'),
    gender: 'male',
    address: '202 Hill Street, Peshawar, Pakistan',
    bloodType: 'O-',
    emergencyContact: {
      name: 'Sana Ahmed',
      relationship: 'Sister',
      phoneNumber: '+92 304 1098765'
    }
  },
  {
    firstName: 'Sana',
    lastName: 'Mahmood',
    email: 'sana.mahmood@example.com',
    phoneNumber: '+92 305 6789012',
    dateOfBirth: new Date('1988-11-30'),
    gender: 'female',
    address: '303 Lake View, Multan, Pakistan',
    bloodType: 'A-',
    emergencyContact: {
      name: 'Khalid Mahmood',
      relationship: 'Brother',
      phoneNumber: '+92 305 2109876'
    }
  },
  {
    firstName: 'Ali',
    lastName: 'Hassan',
    email: 'ali.hassan@example.com',
    phoneNumber: '+92 306 7890123',
    dateOfBirth: new Date('1975-09-05'),
    gender: 'male',
    address: '404 Mountain Road, Quetta, Pakistan',
    bloodType: 'B-',
    emergencyContact: {
      name: 'Fatima Hassan',
      relationship: 'Wife',
      phoneNumber: '+92 306 3210987'
    }
  },
  {
    firstName: 'Zainab',
    lastName: 'Qureshi',
    email: 'zainab.qureshi@example.com',
    phoneNumber: '+92 307 8901234',
    dateOfBirth: new Date('1992-01-12'),
    gender: 'female',
    address: '505 Valley Road, Sialkot, Pakistan',
    bloodType: 'AB+',
    emergencyContact: {
      name: 'Asad Qureshi',
      relationship: 'Husband',
      phoneNumber: '+92 307 4321098'
    }
  },
  {
    firstName: 'Usman',
    lastName: 'Khan',
    email: 'usman.khan@example.com',
    phoneNumber: '+92 308 9012345',
    dateOfBirth: new Date('1980-04-20'),
    gender: 'male',
    address: '606 Ocean View, Gujranwala, Pakistan',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Amina Khan',
      relationship: 'Wife',
      phoneNumber: '+92 308 5432109'
    }
  },
  {
    firstName: 'Amina',
    lastName: 'Farooq',
    email: 'amina.farooq@example.com',
    phoneNumber: '+92 309 0123456',
    dateOfBirth: new Date('1993-06-08'),
    gender: 'female',
    address: '707 Forest Lane, Rawalpindi, Pakistan',
    bloodType: 'A+',
    emergencyContact: {
      name: 'Saad Farooq',
      relationship: 'Brother',
      phoneNumber: '+92 309 6543210'
    }
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();

    console.log('Connected to MongoDB. Starting seed process...');

    // Clear existing data
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});

    // Keep existing users or create default ones if none exist
    const adminExists = await User.findOne({ role: UserRole.ADMIN });
    const doctorExists = await User.findOne({ role: UserRole.DERMATOLOGIST });
    const receptionistExists = await User.findOne({ role: UserRole.RECEPTIONIST });

    let adminId, doctorId, receptionistId;

    // Create default users if they don't exist
    if (!adminExists) {
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@psc.com',
        password: await hashPassword('password123'),
        role: UserRole.ADMIN,
        isActive: true,
      });
      adminId = admin._id;
      console.log('Created admin user');
    } else {
      adminId = adminExists._id;
      console.log('Admin user already exists');
    }

    if (!doctorExists) {
      const doctor = await User.create({
        firstName: 'Dr',
        lastName: 'Dermatologist',
        email: 'doctor@psc.com',
        password: await hashPassword('password123'),
        role: UserRole.DERMATOLOGIST,
        isActive: true,
      });
      doctorId = doctor._id;
      console.log('Created dermatologist user');
    } else {
      doctorId = doctorExists._id;
      console.log('Dermatologist user already exists');
    }

    if (!receptionistExists) {
      const receptionist = await User.create({
        firstName: 'Front',
        lastName: 'Desk',
        email: 'receptionist@psc.com',
        password: await hashPassword('password123'),
        role: UserRole.RECEPTIONIST,
        isActive: true,
      });
      receptionistId = receptionist._id;
      console.log('Created receptionist user');
    } else {
      receptionistId = receptionistExists._id;
      console.log('Receptionist user already exists');
    }

    // Create patients
    const createdPatients = await Patient.insertMany(patients);
    console.log(`Created ${createdPatients.length} patients`);

    // Get available services
    const services = await Service.find({});
    if (services.length === 0) {
      console.log('No services found. Please run the service seeding first.');
      return;
    }

    // Create appointments (3 for each patient)
    const appointments = [];

    for (const patient of createdPatients) {
      // Past appointment
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30));

      // Current appointment
      const currentDate = new Date();

      // Future appointment
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30));

      const startTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
      const endTimes = ['09:30', '10:30', '11:30', '12:30', '14:30', '15:30', '16:30', '17:30'];

      const randomIndex1 = Math.floor(Math.random() * startTimes.length);
      const randomIndex2 = Math.floor(Math.random() * startTimes.length);
      const randomIndex3 = Math.floor(Math.random() * startTimes.length);

      appointments.push({
        patient: patient._id,
        dermatologist: doctorId,
        service: services[Math.floor(Math.random() * services.length)]._id,
        date: pastDate,
        startTime: startTimes[randomIndex1],
        endTime: endTimes[randomIndex1],
        reason: 'Skin consultation',
        status: AppointmentStatus.COMPLETED,
        notes: 'Patient reported itchy skin',
        createdBy: receptionistId
      });

      appointments.push({
        patient: patient._id,
        dermatologist: doctorId,
        service: services[Math.floor(Math.random() * services.length)]._id,
        date: currentDate,
        startTime: startTimes[randomIndex2],
        endTime: endTimes[randomIndex2],
        reason: 'Follow-up consultation',
        status: AppointmentStatus.SCHEDULED,
        notes: 'Check progress on previous treatment',
        createdBy: receptionistId
      });

      appointments.push({
        patient: patient._id,
        dermatologist: doctorId,
        service: services[Math.floor(Math.random() * services.length)]._id,
        date: futureDate,
        startTime: startTimes[randomIndex3],
        endTime: endTimes[randomIndex3],
        reason: 'Regular checkup',
        status: AppointmentStatus.SCHEDULED,
        notes: '',
        createdBy: receptionistId
      });
    }

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`Created ${createdAppointments.length} appointments`);

    // Create prescriptions (2 for each patient)
    const prescriptions = [];
    const medicationNames = [
      'Tretinoin Cream 0.025%',
      'Hydrocortisone Cream 1%',
      'Clindamycin Gel 1%',
      'Benzoyl Peroxide 2.5%',
      'Adapalene Gel 0.1%',
      'Salicylic Acid Solution 2%',
      'Ketoconazole Cream 2%',
      'Azelaic Acid Cream 20%',
      'Metronidazole Gel 0.75%',
      'Tacrolimus Ointment 0.1%'
    ];

    for (const patient of createdPatients) {
      // Past prescription
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 60));

      // Recent prescription
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - Math.floor(Math.random() * 30));

      // Create follow-up date
      const followUpDate = new Date(pastDate);
      followUpDate.setDate(followUpDate.getDate() + 28); // 4 weeks later

      prescriptions.push({
        patient: patient._id,
        dermatologist: doctorId,
        date: pastDate,
        diagnosis: 'Acne Vulgaris',
        medications: [
          {
            name: medicationNames[Math.floor(Math.random() * medicationNames.length)],
            dosage: 'Apply once daily',
            frequency: 'Every night before bed',
            duration: '4 weeks',
            instructions: 'Apply a pea-sized amount to affected areas'
          },
          {
            name: medicationNames[Math.floor(Math.random() * medicationNames.length)],
            dosage: 'Apply twice daily',
            frequency: 'Morning and evening',
            duration: '2 weeks',
            instructions: 'Apply to clean, dry skin'
          }
        ],
        notes: 'Patient should return for follow-up in 4 weeks',
        followUpDate: followUpDate
      });

      prescriptions.push({
        patient: patient._id,
        dermatologist: doctorId,
        date: recentDate,
        diagnosis: 'Eczema',
        medications: [
          {
            name: medicationNames[Math.floor(Math.random() * medicationNames.length)],
            dosage: 'Apply twice daily',
            frequency: 'Morning and evening',
            duration: '2 weeks',
            instructions: 'Apply to affected areas'
          }
        ],
        notes: 'Use gentle, fragrance-free soap'
      });
    }

    const createdPrescriptions = await Prescription.insertMany(prescriptions);
    console.log(`Created ${createdPrescriptions.length} prescriptions`);

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedDatabase();
