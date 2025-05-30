import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/user.model';
import Patient from '../models/patient.model';
import Appointment, { AppointmentStatus } from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import Billing, { PaymentStatus, PaymentMethod } from '../models/billing.model';
import Service from '../models/service.model';
// import { encrypt } from '../utils/encryption';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Generate a random date within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format time in HH:MM format
const formatTime = (hours: number, minutes: number) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Generate a random invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${prefix}-${year}${month}-${randomNum}`;
};

// Seed patients
const seedPatients = async (adminUser: any, doctorUser: any) => {
  try {
    console.log('Seeding patients...');

    const patientData = [
      {
        firstName: 'Ahmed',
        lastName: 'Khan',
        email: 'ahmed.khan@example.com',
        phoneNumber: '+92 300 1234567',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        address: '123 Main Street, Islamabad, Pakistan',
        emergencyContact: {
          name: 'Fatima Khan',
          relationship: 'Wife',
          phoneNumber: '+92 300 7654321'
        },
        bloodType: 'O+',
        medicalHistory: JSON.stringify([
          {
            condition: 'Eczema',
            diagnosis: 'Atopic Dermatitis',
            notes: 'Recurring condition, worse in winter',
            diagnosedAt: new Date('2018-03-10')
          },
          {
            condition: 'Acne',
            diagnosis: 'Acne Vulgaris',
            notes: 'Moderate severity',
            diagnosedAt: new Date('2019-07-22')
          }
        ]),
        allergies: JSON.stringify(['Penicillin', 'Dust mites'])
      },
      {
        firstName: 'Fatima',
        lastName: 'Ali',
        email: 'fatima.ali@example.com',
        phoneNumber: '+92 301 2345678',
        dateOfBirth: new Date('1990-08-21'),
        gender: 'female',
        address: '456 Park Avenue, Lahore, Pakistan',
        emergencyContact: {
          name: 'Imran Ali',
          relationship: 'Husband',
          phoneNumber: '+92 301 8765432'
        },
        bloodType: 'A+',
        medicalHistory: JSON.stringify([
          {
            condition: 'Psoriasis',
            diagnosis: 'Plaque Psoriasis',
            notes: 'Affects elbows and knees',
            diagnosedAt: new Date('2020-01-15')
          }
        ]),
        allergies: JSON.stringify(['Sulfa drugs', 'Pollen'])
      },
      {
        firstName: 'Muhammad',
        lastName: 'Raza',
        email: 'muhammad.raza@example.com',
        phoneNumber: '+92 302 3456789',
        dateOfBirth: new Date('1975-12-03'),
        gender: 'male',
        address: '789 Garden Road, Karachi, Pakistan',
        emergencyContact: {
          name: 'Aisha Raza',
          relationship: 'Daughter',
          phoneNumber: '+92 302 9876543'
        },
        bloodType: 'B-',
        medicalHistory: JSON.stringify([
          {
            condition: 'Rosacea',
            diagnosis: 'Erythematotelangiectatic Rosacea',
            notes: 'Triggered by spicy food and sun exposure',
            diagnosedAt: new Date('2021-05-20')
          },
          {
            condition: 'Seborrheic Dermatitis',
            diagnosis: 'Seborrheic Dermatitis',
            notes: 'Affects scalp and face',
            diagnosedAt: new Date('2022-02-10')
          }
        ]),
        allergies: JSON.stringify(['Latex', 'Shellfish'])
      },
      {
        firstName: 'Aisha',
        lastName: 'Malik',
        email: 'aisha.malik@example.com',
        phoneNumber: '+92 303 4567890',
        dateOfBirth: new Date('1995-03-27'),
        gender: 'female',
        address: '101 River View, Faisalabad, Pakistan',
        emergencyContact: {
          name: 'Tariq Malik',
          relationship: 'Father',
          phoneNumber: '+92 303 0987654'
        },
        bloodType: 'AB+',
        medicalHistory: JSON.stringify([
          {
            condition: 'Contact Dermatitis',
            diagnosis: 'Allergic Contact Dermatitis',
            notes: 'Reaction to nickel in jewelry',
            diagnosedAt: new Date('2022-08-05')
          }
        ]),
        allergies: JSON.stringify(['Nickel', 'Fragrances'])
      },
      {
        firstName: 'Imran',
        lastName: 'Ahmed',
        email: 'imran.ahmed@example.com',
        phoneNumber: '+92 304 5678901',
        dateOfBirth: new Date('1980-11-12'),
        gender: 'male',
        address: '222 Mountain View, Peshawar, Pakistan',
        emergencyContact: {
          name: 'Sana Ahmed',
          relationship: 'Wife',
          phoneNumber: '+92 304 1098765'
        },
        bloodType: 'O-',
        medicalHistory: JSON.stringify([
          {
            condition: 'Vitiligo',
            diagnosis: 'Non-segmental Vitiligo',
            notes: 'Patches on hands and face',
            diagnosedAt: new Date('2019-10-30')
          },
          {
            condition: 'Folliculitis',
            diagnosis: 'Bacterial Folliculitis',
            notes: 'Recurrent on back and chest',
            diagnosedAt: new Date('2021-07-15')
          }
        ]),
        allergies: JSON.stringify(['Iodine', 'Certain antibiotics'])
      }
    ];

    const patients = [];

    for (const data of patientData) {
      const existingPatient = await Patient.findOne({ email: data.email });

      if (!existingPatient) {
        const patient = await Patient.create(data);
        console.log(`Patient created: ${patient.firstName} ${patient.lastName}`);
        patients.push(patient);
      } else {
        console.log(`Patient already exists: ${data.email}`);
        patients.push(existingPatient);
      }
    }

    return patients;
  } catch (error) {
    console.error('Error seeding patients:', error);
    return [];
  }
};

// Seed appointments
const seedAppointments = async (patients: any[], doctorUser: any, receptionistUser: any) => {
  try {
    console.log('Seeding appointments...');

    // Get services for appointments
    const services = await Service.find();
    if (services.length === 0) {
      console.error('No services found. Please run the service seeder first.');
      return [];
    }

    const appointments = [];
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);

    // Create past appointments (completed)
    for (let i = 0; i < 5; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const appointmentDate = randomDate(oneMonthAgo, today);
      const startHour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

      const randomService = services[Math.floor(Math.random() * services.length)];
      const appointmentData = {
        patient: patient._id,
        dermatologist: doctorUser._id,
        service: randomService._id,
        date: appointmentDate,
        startTime: formatTime(startHour, startMinute),
        endTime: formatTime(startHour + 1, startMinute),
        status: AppointmentStatus.COMPLETED,
        reason: ['Skin rash', 'Acne treatment', 'Eczema follow-up', 'Psoriasis check', 'Mole examination'][Math.floor(Math.random() * 5)],
        notes: 'Patient arrived on time. Treatment provided as planned.',
        createdBy: receptionistUser._id
      };

      const existingAppointment = await Appointment.findOne({
        patient: appointmentData.patient,
        dermatologist: appointmentData.dermatologist,
        date: appointmentData.date
      });

      if (!existingAppointment) {
        const appointment = await Appointment.create(appointmentData);
        console.log(`Past appointment created for patient: ${patient.firstName} ${patient.lastName}`);
        appointments.push(appointment);
      }
    }

    // Create today's appointments
    for (let i = 0; i < 2; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const startHour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

      const randomService = services[Math.floor(Math.random() * services.length)];
      const appointmentData = {
        patient: patient._id,
        dermatologist: doctorUser._id,
        service: randomService._id,
        date: today,
        startTime: formatTime(startHour, startMinute),
        endTime: formatTime(startHour + 1, startMinute),
        status: AppointmentStatus.CONFIRMED,
        reason: ['Skin rash', 'Acne treatment', 'Eczema follow-up', 'Psoriasis check', 'Mole examination'][Math.floor(Math.random() * 5)],
        notes: 'Reminder sent to patient.',
        createdBy: receptionistUser._id
      };

      const existingAppointment = await Appointment.findOne({
        patient: appointmentData.patient,
        dermatologist: appointmentData.dermatologist,
        date: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      });

      if (!existingAppointment) {
        const appointment = await Appointment.create(appointmentData);
        console.log(`Today's appointment created for patient: ${patient.firstName} ${patient.lastName}`);
        appointments.push(appointment);
      }
    }

    // Create future appointments
    for (let i = 0; i < 3; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const appointmentDate = randomDate(today, oneMonthLater);
      const startHour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

      const randomService = services[Math.floor(Math.random() * services.length)];
      const appointmentData = {
        patient: patient._id,
        dermatologist: doctorUser._id,
        service: randomService._id,
        date: appointmentDate,
        startTime: formatTime(startHour, startMinute),
        endTime: formatTime(startHour + 1, startMinute),
        status: AppointmentStatus.SCHEDULED,
        reason: ['Skin rash', 'Acne treatment', 'Eczema follow-up', 'Psoriasis check', 'Mole examination'][Math.floor(Math.random() * 5)],
        notes: 'Initial consultation.',
        createdBy: receptionistUser._id
      };

      const existingAppointment = await Appointment.findOne({
        patient: appointmentData.patient,
        dermatologist: appointmentData.dermatologist,
        date: appointmentData.date
      });

      if (!existingAppointment) {
        const appointment = await Appointment.create(appointmentData);
        console.log(`Future appointment created for patient: ${patient.firstName} ${patient.lastName}`);
        appointments.push(appointment);
      }
    }

    return appointments;
  } catch (error) {
    console.error('Error seeding appointments:', error);
    return [];
  }
};

// Seed prescriptions
const seedPrescriptions = async (patients: any[], doctorUser: any, appointments: any[]) => {
  try {
    console.log('Seeding prescriptions...');

    const prescriptions = [];
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // Common skin medications
    const medications = [
      {
        name: 'Tretinoin Cream',
        dosage: '0.025%',
        frequency: 'Once daily at night',
        duration: '3 months',
        instructions: 'Apply a pea-sized amount to affected areas. Avoid sun exposure and use sunscreen.'
      },
      {
        name: 'Hydrocortisone Cream',
        dosage: '1%',
        frequency: 'Twice daily',
        duration: '2 weeks',
        instructions: 'Apply a thin layer to affected areas. Do not use on face unless directed.'
      },
      {
        name: 'Clindamycin Gel',
        dosage: '1%',
        frequency: 'Twice daily',
        duration: '1 month',
        instructions: 'Apply to clean, dry skin. Avoid contact with eyes and mouth.'
      },
      {
        name: 'Benzoyl Peroxide Wash',
        dosage: '4%',
        frequency: 'Once daily',
        duration: '2 months',
        instructions: 'Use in shower on affected areas. Rinse thoroughly. May bleach fabrics.'
      },
      {
        name: 'Tacrolimus Ointment',
        dosage: '0.1%',
        frequency: 'Twice daily',
        duration: '2 weeks',
        instructions: 'Apply a thin layer to affected areas. Wash hands after application.'
      }
    ];

    // Common skin diagnoses
    const diagnoses = [
      'Acne Vulgaris',
      'Atopic Dermatitis',
      'Psoriasis',
      'Contact Dermatitis',
      'Seborrheic Dermatitis',
      'Rosacea',
      'Tinea Corporis',
      'Urticaria'
    ];

    // Create prescriptions for completed appointments
    const completedAppointments = appointments.filter(app => app.status === AppointmentStatus.COMPLETED);

    for (const appointment of completedAppointments) {
      const patient = patients.find(p => p._id.toString() === appointment.patient.toString());

      if (patient) {
        const prescriptionData = {
          patient: patient._id,
          dermatologist: doctorUser._id,
          date: appointment.date,
          diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
          medications: [
            medications[Math.floor(Math.random() * medications.length)],
            medications[Math.floor(Math.random() * medications.length)]
          ],
          notes: 'Follow instructions carefully. Contact clinic if any adverse reactions occur.',
          followUpDate: new Date(appointment.date.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days later
        };

        const existingPrescription = await Prescription.findOne({
          patient: prescriptionData.patient,
          dermatologist: prescriptionData.dermatologist,
          date: prescriptionData.date
        });

        if (!existingPrescription) {
          const prescription = await Prescription.create(prescriptionData);
          console.log(`Prescription created for patient: ${patient.firstName} ${patient.lastName}`);

          // Update patient's prescriptions array
          await Patient.findByIdAndUpdate(patient._id, {
            $push: { prescriptions: prescription._id }
          });

          prescriptions.push(prescription);
        }
      }
    }

    return prescriptions;
  } catch (error) {
    console.error('Error seeding prescriptions:', error);
    return [];
  }
};

// Seed billings
const seedBillings = async (patients: any[], adminUser: any, appointments: any[]) => {
  try {
    console.log('Seeding billings...');

    const billings = [];

    // Common dermatology services
    const services = [
      {
        name: 'Initial Consultation',
        description: 'First-time patient consultation',
        unitPrice: 3000
      },
      {
        name: 'Follow-up Consultation',
        description: 'Follow-up visit',
        unitPrice: 2000
      },
      {
        name: 'Skin Biopsy',
        description: 'Removal of small skin sample for testing',
        unitPrice: 5000
      },
      {
        name: 'Acne Treatment',
        description: 'Specialized acne treatment session',
        unitPrice: 4000
      },
      {
        name: 'Eczema Treatment',
        description: 'Specialized eczema treatment',
        unitPrice: 3500
      },
      {
        name: 'Psoriasis Treatment',
        description: 'Specialized psoriasis treatment',
        unitPrice: 4500
      },
      {
        name: 'Mole Removal',
        description: 'Removal of suspicious mole',
        unitPrice: 6000
      },
      {
        name: 'Prescription Medication',
        description: 'Prescribed medication',
        unitPrice: 1500
      }
    ];

    // Create billings for completed appointments
    const completedAppointments = appointments.filter(app => app.status === AppointmentStatus.COMPLETED);

    for (const appointment of completedAppointments) {
      const patient = patients.find(p => p._id.toString() === appointment.patient.toString());

      if (patient) {
        // Select 1-3 random services
        const numServices = 1 + Math.floor(Math.random() * 3);
        const selectedServices = [];
        let subtotal = 0;

        for (let i = 0; i < numServices; i++) {
          const service = services[Math.floor(Math.random() * services.length)];
          const quantity = 1;
          const totalPrice = service.unitPrice * quantity;

          selectedServices.push({
            name: service.name,
            description: service.description,
            quantity: quantity,
            unitPrice: service.unitPrice,
            totalPrice: totalPrice
          });

          subtotal += totalPrice;
        }

        const tax = Math.round(subtotal * 0.16); // 16% tax
        const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0; // 10% discount sometimes
        const total = subtotal + tax - discount;

        // Randomly decide if fully paid or partially paid
        const isPaid = Math.random() > 0.3;
        const amountPaid = isPaid ? total : Math.round(total * 0.5);
        const balance = total - amountPaid;
        const paymentStatus = isPaid ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID;

        const billingData = {
          patient: patient._id,
          appointment: appointment._id,
          invoiceNumber: generateInvoiceNumber(),
          date: appointment.date,
          dueDate: new Date(appointment.date.getTime() + (15 * 24 * 60 * 60 * 1000)), // 15 days later
          services: selectedServices,
          subtotal: subtotal,
          tax: tax,
          discount: discount,
          total: total,
          amountPaid: amountPaid,
          balance: balance,
          paymentStatus: paymentStatus,
          paymentMethod: isPaid ? PaymentMethod.CASH : undefined,
          paymentDate: isPaid ? appointment.date : undefined,
          notes: isPaid ? 'Payment received in full' : 'Partial payment received',
          createdBy: adminUser._id
        };

        const existingBilling = await Billing.findOne({
          patient: billingData.patient,
          appointment: billingData.appointment
        });

        if (!existingBilling) {
          const billing = await Billing.create(billingData);
          console.log(`Billing created for patient: ${patient.firstName} ${patient.lastName}`);

          // Update patient's billings array
          await Patient.findByIdAndUpdate(patient._id, {
            $push: { billings: billing._id }
          });

          billings.push(billing);
        }
      }
    }

    return billings;
  } catch (error) {
    console.error('Error seeding billings:', error);
    return [];
  }
};

// Run the seeder
const runSeeder = async () => {
  try {
    await connectDB();

    // Get users
    const adminUser = await User.findOne({ email: 'admin@psc.com' });
    const doctorUser = await User.findOne({ email: 'doctor@psc.com' });
    const receptionistUser = await User.findOne({ email: 'receptionist@psc.com' });

    if (!adminUser || !doctorUser || !receptionistUser) {
      console.error('Required users not found. Please run the user seeder first.');
      process.exit(1);
    }

    // Seed data
    const patients = await seedPatients(adminUser, doctorUser);
    const appointments = await seedAppointments(patients, doctorUser, receptionistUser);
    const prescriptions = await seedPrescriptions(patients, doctorUser, appointments);
    const billings = await seedBillings(patients, adminUser, appointments);

    console.log('Database seeded successfully');
    console.log(`Created ${patients.length} patients`);
    console.log(`Created ${appointments.length} appointments`);
    console.log(`Created ${prescriptions.length} prescriptions`);
    console.log(`Created ${billings.length} billings`);

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeeder();