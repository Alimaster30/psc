import mongoose from 'mongoose';
import Patient from './src/models/patient.model';
import Appointment from './src/models/appointment.model';
import Prescription from './src/models/prescription.model';
import Billing from './src/models/billing.model';
import User from './src/models/user.model';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pakskincare');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Billing.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const receptionistPassword = await bcrypt.hash('reception123', 10);

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@psc.com',
      password: adminPassword,
      role: 'admin',
      phoneNumber: '+92 300 1234567',
      isActive: true
    });

    const doctor = await User.create({
      firstName: 'Dr',
      lastName: 'Dermatologist',
      email: 'doctor@psc.com',
      password: doctorPassword,
      role: 'dermatologist',
      phoneNumber: '+92 300 7654321',
      isActive: true
    });

    const receptionist = await User.create({
      firstName: 'Front',
      lastName: 'Desk',
      email: 'receptionist@psc.com',
      password: receptionistPassword,
      role: 'receptionist',
      phoneNumber: '+92 300 9876543',
      isActive: true
    });

    console.log('Created users');

    // Create patients
    const patients = [];
    const genders = ['male', 'female'];
    const names = [
      { first: 'Ali', last: 'Khan' },
      { first: 'Fatima', last: 'Ahmed' },
      { first: 'Hassan', last: 'Malik' },
      { first: 'Ayesha', last: 'Siddiqui' },
      { first: 'Omar', last: 'Farooq' }
    ];

    for (let i = 0; i < 10; i++) {
      const nameIndex = Math.floor(Math.random() * names.length);
      const genderIndex = Math.floor(Math.random() * genders.length);

      const patient = await Patient.create({
        firstName: names[nameIndex].first,
        lastName: names[nameIndex].last + (i > 4 ? ' ' + i : ''),
        email: `patient${i + 1}@example.com`,
        phoneNumber: `+92 300 ${Math.floor(1000000 + Math.random() * 9000000)}`,
        gender: genders[genderIndex],
        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `House #${Math.floor(Math.random() * 100)}, Street ${Math.floor(Math.random() * 20)}, Islamabad`,
        medicalHistory: 'No significant medical history',
        allergies: 'None known',
        emergencyContact: {
          name: 'Emergency Contact',
          phoneNumber: `+92 300 ${Math.floor(1000000 + Math.random() * 9000000)}`,
          relationship: 'Family'
        }
      });

      patients.push(patient);
    }

    console.log('Created patients');

    // Create appointments
    const statuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
    const appointments = [];

    // Create appointments for the past 3 months
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    for (let i = 0; i < 30; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Random date between 3 months ago and today
      const appointmentDate = new Date(
        threeMonthsAgo.getTime() + Math.random() * (today.getTime() - threeMonthsAgo.getTime())
      );

      // Set hours between 9 AM and 5 PM
      appointmentDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

      // Set start and end time (30 minute appointments)
      const startTime = `${appointmentDate.getHours()}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;
      const endDate = new Date(appointmentDate);
      endDate.setMinutes(endDate.getMinutes() + 30);
      const endTime = `${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const appointment = await Appointment.create({
        patient: patient._id,
        dermatologist: doctor._id,
        date: appointmentDate,
        startTime: startTime,
        endTime: endTime,
        reason: 'Skin consultation',
        status,
        notes: status === 'completed' ? 'Patient examined and prescribed treatment' : '',
        createdBy: receptionist._id
      });

      appointments.push(appointment);
    }

    console.log('Created appointments');

    // Create prescriptions for completed appointments
    const medications = [
      {
        name: 'Tretinoin Cream',
        dosage: '0.025%',
        instructions: 'Apply a pea-sized amount to affected areas at night',
        frequency: 'Once daily',
        duration: '4 weeks'
      },
      {
        name: 'Clindamycin Solution',
        dosage: '1%',
        instructions: 'Apply to affected areas twice daily',
        frequency: 'Twice daily',
        duration: '2 weeks'
      },
      {
        name: 'Benzoyl Peroxide Wash',
        dosage: '4%',
        instructions: 'Use once daily in the shower',
        frequency: 'Once daily',
        duration: '4 weeks'
      },
      {
        name: 'Hydrocortisone Cream',
        dosage: '1%',
        instructions: 'Apply to affected areas twice daily for 7 days',
        frequency: 'Twice daily',
        duration: '1 week'
      },
      {
        name: 'Ketoconazole Shampoo',
        dosage: '2%',
        instructions: 'Use twice weekly for 4 weeks',
        frequency: 'Twice weekly',
        duration: '4 weeks'
      }
    ];

    const completedAppointments = appointments.filter(a => a.status === 'completed');

    for (const appointment of completedAppointments) {
      // Add 1-3 medications to each prescription
      const prescriptionMeds = [];
      const medCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < medCount; i++) {
        const med = medications[Math.floor(Math.random() * medications.length)];
        prescriptionMeds.push({
          name: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          frequency: med.frequency,
          duration: med.duration
        });
      }

      // Common skin conditions for diagnosis
      const diagnoses = [
        'Acne Vulgaris',
        'Atopic Dermatitis',
        'Psoriasis',
        'Rosacea',
        'Contact Dermatitis'
      ];

      await Prescription.create({
        patient: appointment.patient,
        doctor: doctor._id,
        dermatologist: doctor._id,
        appointment: appointment._id,
        medications: prescriptionMeds,
        notes: 'Follow up in 2 weeks if no improvement',
        diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
        createdAt: appointment.date
      });
    }

    console.log('Created prescriptions');

    // Create billings for completed appointments
    const services = [
      { name: 'Consultation', amount: 1500, unitPrice: 1500, quantity: 1 },
      { name: 'Acne Treatment', amount: 3000, unitPrice: 3000, quantity: 1 },
      { name: 'Skin Biopsy', amount: 5000, unitPrice: 5000, quantity: 1 },
      { name: 'Mole Removal', amount: 4000, unitPrice: 4000, quantity: 1 },
      { name: 'Laser Therapy', amount: 7000, unitPrice: 7000, quantity: 1 }
    ];

    for (const appointment of completedAppointments) {
      // Add 1-2 services to each billing
      const billingServices = [];
      const serviceCount = Math.floor(Math.random() * 2) + 1;
      let total = 0;

      for (let i = 0; i < serviceCount; i++) {
        const service = services[Math.floor(Math.random() * services.length)];
        billingServices.push({
          name: service.name,
          amount: service.amount,
          unitPrice: service.unitPrice,
          quantity: service.quantity,
          totalPrice: service.unitPrice * service.quantity
        });
        total += service.amount;
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

      // Set due date (7 days from appointment)
      const dueDate = new Date(appointment.date);
      dueDate.setDate(dueDate.getDate() + 7);

      await Billing.create({
        patient: appointment.patient,
        appointment: appointment._id,
        services: billingServices,
        totalAmount: total,
        amountPaid: total,
        paymentMethod: Math.random() > 0.5 ? 'cash' : 'credit_card',
        date: appointment.date,
        createdBy: receptionist._id,
        invoiceNumber: invoiceNumber,
        dueDate: dueDate,
        subtotal: total,
        total: total,
        balance: 0,
        paymentStatus: 'paid'
      });
    }

    console.log('Created billings');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
