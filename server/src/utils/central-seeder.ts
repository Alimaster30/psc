import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/user.model';
import Patient from '../models/patient.model';
import Appointment, { AppointmentStatus } from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import Billing, { PaymentStatus, PaymentMethod } from '../models/billing.model';
import Service from '../models/service.model';
import Visit from '../models/visit.model';
import Settings from '../models/settings.model';
import { encrypt } from './encryption';

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

// Utility functions
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const formatTime = (hours: number, minutes: number) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${prefix}-${year}${month}-${randomNum}`;
};

// Clear all existing data
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');

    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Billing.deleteMany({});
    await Service.deleteMany({});
    await Visit.deleteMany({});
    await Settings.deleteMany({});

    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Seed Users
const seedUsers = async () => {
  try {
    console.log('👥 Seeding users...');

    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@psc.com',
        password: 'Admin123!',
        role: UserRole.ADMIN,
        phoneNumber: '+92 300 1234567',
        isActive: true,
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Ahmed',
        email: 'doctor@psc.com',
        password: 'Doctor123!',
        role: UserRole.DERMATOLOGIST,
        phoneNumber: '+92 301 2345678',
        isActive: true,
      },
      {
        firstName: 'Fatima',
        lastName: 'Khan',
        email: 'receptionist@psc.com',
        password: 'Reception123!',
        role: UserRole.RECEPTIONIST,
        phoneNumber: '+92 302 3456789',
        isActive: true,
      },
      {
        firstName: 'Dr. Ali',
        lastName: 'Hassan',
        email: 'doctor2@psc.com',
        password: 'Doctor123!',
        role: UserRole.DERMATOLOGIST,
        phoneNumber: '+92 303 4567890',
        isActive: true,
      },
      {
        firstName: 'Aisha',
        lastName: 'Malik',
        email: 'receptionist2@psc.com',
        password: 'Reception123!',
        role: UserRole.RECEPTIONIST,
        phoneNumber: '+92 304 5678901',
        isActive: true,
      }
    ];

    // Create users one by one to trigger password hashing middleware
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed Services
const seedServices = async () => {
  try {
    console.log('🏥 Seeding services...');

    const services = [
      // FACIALS
      {
        name: 'Simple Hydrafacial',
        description: 'Deeply cleanses and exfoliates the skin. Infuses the skin with hydration and nutrients. Improves skin texture and tone.',
        price: 7000,
        category: 'Facials',
        process: 'Cleansing\nScrubbing\nHydra facial tools:\nScrubber\nAbrasion\nRF\nUltrasound\nCold hammer\nSpray\nPDT Light',
        bundleOptions: [
          { sessions: 3, price: 24000, savings: 4000 }
        ]
      },
      {
        name: 'Silver Hydrafacial',
        description: 'Luxurious 10-step skincare experience. Advanced treatments for radiant skin. Intensive hydration and rejuvenation.',
        price: 9000,
        category: 'Facials',
        process: 'Cleansing\nScrubbing\nHydra facial tools\nBrightening serum\nBrightening peel and mask',
        bundleOptions: [
          { sessions: 3, price: 30000, savings: 6000 }
        ]
      },
      {
        name: 'Gold Hydrafacial',
        description: 'Exclusive facial journey. Tailored to individual skin needs. High-end products for ultimate luxury.',
        price: 11000,
        category: 'Facials',
        process: 'Cleansing\nScrubbing\nHydra facial tools\nCarbon peel laser\nMask\nToner',
        bundleOptions: [
          { sessions: 3, price: 38000, savings: 6000 }
        ]
      },
      {
        name: 'Korean Hydrafacial (Glass Skin Treatment)',
        description: 'Advanced skin treatment for Korean glass skin. All products from cleansing to toner are Korean products.',
        price: 12000,
        category: 'Facials',
        process: 'Cleansing\nExfoliation\nHydra facial tools\nKorean collagen mask\nKorean toner'
      },
      {
        name: 'Signature Hydrafacial',
        description: 'Customized hydration treatment. Deeply nourishes and revitalizes skin. Restores moisture balance for radiant complexion.',
        price: 10000,
        category: 'Facials',
        process: 'Cleansing\nScrubbing\nHydra facial tools\nCarbon peel laser\nBrightening peel\nJelly mask\nToner',
        bundleOptions: [
          { sessions: 4, price: 30000, savings: 10000 },
          { sessions: 8, price: 60000, savings: 20000 }
        ]
      },
      {
        name: 'Exosomes Booster Facial',
        description: 'Advanced anti-aging treatment with exosome technology.',
        price: 40000,
        category: 'Facials',
        bundleOptions: [
          { sessions: 3, price: 110000, savings: 10000 },
          { sessions: 6, price: 220000, savings: 20000 }
        ]
      },
      // LASER TREATMENTS
      {
        name: 'Carbon Peel/Hollywood Laser',
        description: 'Non-invasive laser treatment for skin rejuvenation.',
        price: 7000,
        category: 'Laser Treatments'
      },
      {
        name: 'Carbon Peel Facial',
        description: 'Combines carbon peel laser with facial treatment for enhanced results.',
        price: 11000,
        category: 'Laser Treatments'
      },
      {
        name: 'Carbon Laser + Microneedling',
        description: 'Combination treatment for improved skin texture and tone.',
        price: 15000,
        category: 'Laser Treatments'
      },
      {
        name: 'Carbon Peel Laser + RF Microneedling',
        description: 'Advanced combination treatment with radiofrequency for skin tightening.',
        price: 20000,
        category: 'Laser Treatments'
      },
      // CONSULTATIONS
      {
        name: 'Initial Consultation',
        description: 'First-time patient consultation with dermatologist.',
        price: 3000,
        category: 'Consultations'
      },
      {
        name: 'Follow-up Consultation',
        description: 'Follow-up visit with dermatologist.',
        price: 2000,
        category: 'Consultations'
      },
      // ADDITIONAL TREATMENTS
      {
        name: 'Acne Treatment',
        description: 'Specialized acne treatment session.',
        price: 4000,
        category: 'Treatments'
      },
      {
        name: 'Eczema Treatment',
        description: 'Specialized eczema treatment.',
        price: 3500,
        category: 'Treatments'
      },
      {
        name: 'Psoriasis Treatment',
        description: 'Specialized psoriasis treatment.',
        price: 4500,
        category: 'Treatments'
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);
    return createdServices;
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  }
};

// Seed Patients
const seedPatients = async () => {
  try {
    console.log('🏥 Seeding patients...');

    const patients = [
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
      },
      {
        firstName: 'Zara',
        lastName: 'Sheikh',
        email: 'zara.sheikh@example.com',
        phoneNumber: '+92 305 6789012',
        dateOfBirth: new Date('1992-02-14'),
        gender: 'female',
        address: '333 City Center, Multan, Pakistan',
        emergencyContact: {
          name: 'Omar Sheikh',
          relationship: 'Brother',
          phoneNumber: '+92 305 2109876'
        },
        bloodType: 'A-',
        medicalHistory: JSON.stringify([
          {
            condition: 'Melasma',
            diagnosis: 'Facial Melasma',
            notes: 'Pregnancy-related pigmentation',
            diagnosedAt: new Date('2021-09-12')
          }
        ]),
        allergies: JSON.stringify(['Aspirin', 'Certain cosmetics'])
      },
      {
        firstName: 'Hassan',
        lastName: 'Qureshi',
        email: 'hassan.qureshi@example.com',
        phoneNumber: '+92 306 7890123',
        dateOfBirth: new Date('1988-07-08'),
        gender: 'male',
        address: '444 Green Valley, Rawalpindi, Pakistan',
        emergencyContact: {
          name: 'Mariam Qureshi',
          relationship: 'Sister',
          phoneNumber: '+92 306 3210987'
        },
        bloodType: 'B+',
        medicalHistory: JSON.stringify([
          {
            condition: 'Keratosis Pilaris',
            diagnosis: 'Keratosis Pilaris',
            notes: 'Rough patches on arms and legs',
            diagnosedAt: new Date('2020-11-25')
          }
        ]),
        allergies: JSON.stringify(['Wool', 'Certain detergents'])
      },
      {
        firstName: 'Sana',
        lastName: 'Butt',
        email: 'sana.butt@example.com',
        phoneNumber: '+92 307 8901234',
        dateOfBirth: new Date('1993-12-30'),
        gender: 'female',
        address: '555 Rose Garden, Sialkot, Pakistan',
        emergencyContact: {
          name: 'Kamran Butt',
          relationship: 'Husband',
          phoneNumber: '+92 307 4321098'
        },
        bloodType: 'AB-',
        medicalHistory: JSON.stringify([
          {
            condition: 'Urticaria',
            diagnosis: 'Chronic Urticaria',
            notes: 'Stress-induced hives',
            diagnosedAt: new Date('2022-04-18')
          }
        ]),
        allergies: JSON.stringify(['Shellfish', 'Nuts'])
      }
    ];

    const createdPatients = await Patient.insertMany(patients);
    console.log(`✅ Created ${createdPatients.length} patients`);
    return createdPatients;
  } catch (error) {
    console.error('❌ Error seeding patients:', error);
    throw error;
  }
};

// Seed Appointments
const seedAppointments = async (patients: any[], users: any[], services: any[]) => {
  try {
    console.log('📅 Seeding appointments...');

    const doctors = users.filter(user => user.role === UserRole.DERMATOLOGIST);
    const receptionists = users.filter(user => user.role === UserRole.RECEPTIONIST);

    const appointments = [];
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);

    const reasons = [
      'Skin rash examination',
      'Acne treatment consultation',
      'Eczema follow-up',
      'Psoriasis check-up',
      'Mole examination',
      'Facial treatment',
      'Laser therapy session',
      'Routine skin check',
      'Allergy consultation',
      'Cosmetic consultation'
    ];

    // Create past appointments (completed)
    for (let i = 0; i < 15; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const receptionist = receptionists[Math.floor(Math.random() * receptionists.length)];
      const service = services[Math.floor(Math.random() * services.length)];

      const appointmentDate = randomDate(oneMonthAgo, today);
      const startHour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

      appointments.push({
        patient: patient._id,
        dermatologist: doctor._id,
        service: service._id,
        date: appointmentDate,
        startTime: formatTime(startHour, startMinute),
        endTime: formatTime(startHour + 1, startMinute),
        status: AppointmentStatus.COMPLETED,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        notes: 'Patient arrived on time. Treatment completed successfully.',
        createdBy: receptionist._id
      });
    }

    // Create today's appointments
    for (let i = 0; i < 4; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const receptionist = receptionists[Math.floor(Math.random() * receptionists.length)];
      const service = services[Math.floor(Math.random() * services.length)];

      const startHour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

      appointments.push({
        patient: patient._id,
        dermatologist: doctor._id,
        service: service._id,
        date: today,
        startTime: formatTime(startHour, startMinute),
        endTime: formatTime(startHour + 1, startMinute),
        status: AppointmentStatus.CONFIRMED,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        notes: 'Reminder sent to patient.',
        createdBy: receptionist._id
      });
    }

    // Create future appointments
    for (let i = 0; i < 8; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const receptionist = receptionists[Math.floor(Math.random() * receptionists.length)];
      const service = services[Math.floor(Math.random() * services.length)];

      const appointmentDate = randomDate(today, oneMonthLater);
      const startHour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45

      appointments.push({
        patient: patient._id,
        dermatologist: doctor._id,
        service: service._id,
        date: appointmentDate,
        startTime: formatTime(startHour, startMinute),
        endTime: formatTime(startHour + 1, startMinute),
        status: AppointmentStatus.SCHEDULED,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        notes: 'Initial consultation scheduled.',
        createdBy: receptionist._id
      });
    }

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);
    return createdAppointments;
  } catch (error) {
    console.error('❌ Error seeding appointments:', error);
    throw error;
  }
};

// Seed Prescriptions
const seedPrescriptions = async (patients: any[], users: any[], appointments: any[]) => {
  try {
    console.log('💊 Seeding prescriptions...');

    const doctors = users.filter(user => user.role === UserRole.DERMATOLOGIST);
    const completedAppointments = appointments.filter(app => app.status === AppointmentStatus.COMPLETED);

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
      },
      {
        name: 'Clobetasol Propionate',
        dosage: '0.05%',
        frequency: 'Once daily',
        duration: '2 weeks',
        instructions: 'Apply sparingly to affected areas. Do not use for more than 2 weeks.'
      }
    ];

    const diagnoses = [
      'Acne Vulgaris',
      'Atopic Dermatitis',
      'Psoriasis',
      'Contact Dermatitis',
      'Seborrheic Dermatitis',
      'Rosacea',
      'Tinea Corporis',
      'Urticaria',
      'Melasma',
      'Keratosis Pilaris'
    ];

    const prescriptions = [];

    for (const appointment of completedAppointments) {
      const patient = patients.find(p => p._id.toString() === appointment.patient.toString());
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];

      if (patient) {
        const numMedications = 1 + Math.floor(Math.random() * 3); // 1-3 medications
        const selectedMedications = [];

        for (let i = 0; i < numMedications; i++) {
          selectedMedications.push(medications[Math.floor(Math.random() * medications.length)]);
        }

        prescriptions.push({
          patient: patient._id,
          dermatologist: doctor._id,
          date: appointment.date,
          diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
          medications: selectedMedications,
          notes: 'Follow instructions carefully. Contact clinic if any adverse reactions occur.',
          followUpDate: new Date(appointment.date.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days later
        });
      }
    }

    const createdPrescriptions = await Prescription.insertMany(prescriptions);
    console.log(`✅ Created ${createdPrescriptions.length} prescriptions`);

    // Update patients with prescription references
    for (const prescription of createdPrescriptions) {
      await Patient.findByIdAndUpdate(prescription.patient, {
        $push: { prescriptions: prescription._id }
      });
    }

    return createdPrescriptions;
  } catch (error) {
    console.error('❌ Error seeding prescriptions:', error);
    throw error;
  }
};

// Seed Visits
const seedVisits = async (patients: any[], users: any[], appointments: any[], prescriptions: any[]) => {
  try {
    console.log('🏥 Seeding visits...');

    const doctors = users.filter(user => user.role === UserRole.DERMATOLOGIST);
    const completedAppointments = appointments.filter(app => app.status === AppointmentStatus.COMPLETED);

    const visits = [];
    const chiefComplaints = [
      'Skin rash on arms and legs',
      'Persistent acne breakouts',
      'Dry and itchy skin',
      'Red patches on face',
      'Unusual mole changes',
      'Allergic reaction to cosmetics',
      'Scalp irritation and flaking',
      'Pigmentation changes',
      'Skin texture concerns',
      'Follow-up for previous treatment'
    ];

    for (const appointment of completedAppointments) {
      const patient = patients.find(p => p._id.toString() === appointment.patient.toString());
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const relatedPrescription = prescriptions.find(p =>
        p.patient.toString() === appointment.patient.toString() &&
        p.date.getTime() === appointment.date.getTime()
      );

      if (patient) {
        const visitNotes = `Patient presented with ${chiefComplaints[Math.floor(Math.random() * chiefComplaints.length)]}. Physical examination revealed characteristic findings consistent with diagnosis. Treatment plan discussed with patient.`;
        const treatmentPlan = `Continue prescribed medications as directed. Follow-up in 4 weeks. Avoid known triggers. Use gentle skincare products. Apply sunscreen daily.`;

        try {
          visits.push({
            patient: patient._id,
            dermatologist: doctor._id,
            appointment: appointment._id,
            date: appointment.date,
            chiefComplaint: chiefComplaints[Math.floor(Math.random() * chiefComplaints.length)],
            vitalSigns: {
              temperature: 36.5 + Math.random() * 1.5, // 36.5-38°C
              bloodPressure: `${120 + Math.floor(Math.random() * 20)}/${80 + Math.floor(Math.random() * 10)}`,
              heartRate: 60 + Math.floor(Math.random() * 40), // 60-100 bpm
              weight: 50 + Math.floor(Math.random() * 50), // 50-100 kg
              height: 150 + Math.floor(Math.random() * 30) // 150-180 cm
            },
            notes: encrypt(visitNotes),
            diagnosis: relatedPrescription ? relatedPrescription.diagnosis : 'General skin consultation',
            treatmentPlan: encrypt(treatmentPlan),
            prescription: relatedPrescription ? relatedPrescription._id : undefined,
            followUpDate: new Date(appointment.date.getTime() + (28 * 24 * 60 * 60 * 1000)) // 4 weeks later
          });
        } catch (encryptionError) {
          console.warn(`⚠️  Encryption failed for visit, using plain text: ${encryptionError}`);
          visits.push({
            patient: patient._id,
            dermatologist: doctor._id,
            appointment: appointment._id,
            date: appointment.date,
            chiefComplaint: chiefComplaints[Math.floor(Math.random() * chiefComplaints.length)],
            vitalSigns: {
              temperature: 36.5 + Math.random() * 1.5, // 36.5-38°C
              bloodPressure: `${120 + Math.floor(Math.random() * 20)}/${80 + Math.floor(Math.random() * 10)}`,
              heartRate: 60 + Math.floor(Math.random() * 40), // 60-100 bpm
              weight: 50 + Math.floor(Math.random() * 50), // 50-100 kg
              height: 150 + Math.floor(Math.random() * 30) // 150-180 cm
            },
            notes: visitNotes, // Plain text fallback
            diagnosis: relatedPrescription ? relatedPrescription.diagnosis : 'General skin consultation',
            treatmentPlan: treatmentPlan, // Plain text fallback
            prescription: relatedPrescription ? relatedPrescription._id : undefined,
            followUpDate: new Date(appointment.date.getTime() + (28 * 24 * 60 * 60 * 1000)) // 4 weeks later
          });
        }
      }
    }

    const createdVisits = await Visit.insertMany(visits);
    console.log(`✅ Created ${createdVisits.length} visits`);

    // Update patients with visit references
    for (const visit of createdVisits) {
      await Patient.findByIdAndUpdate(visit.patient, {
        $push: { visits: visit._id }
      });
    }

    return createdVisits;
  } catch (error) {
    console.error('❌ Error seeding visits:', error);
    throw error;
  }
};

// Seed Billings
const seedBillings = async (patients: any[], users: any[], appointments: any[], services: any[]) => {
  try {
    console.log('💰 Seeding billings...');

    const admins = users.filter(user => user.role === UserRole.ADMIN);
    const completedAppointments = appointments.filter(app => app.status === AppointmentStatus.COMPLETED);

    const billings = [];

    for (const appointment of completedAppointments) {
      const patient = patients.find(p => p._id.toString() === appointment.patient.toString());
      const admin = admins[Math.floor(Math.random() * admins.length)];
      const appointmentService = services.find(s => s._id.toString() === appointment.service.toString());

      if (patient && appointmentService) {
        // Select 1-3 services for the billing
        const numServices = 1 + Math.floor(Math.random() * 2); // 1-2 additional services
        const selectedServices = [appointmentService]; // Always include the appointment service
        let subtotal = appointmentService.price;

        // Add additional services randomly
        for (let i = 1; i < numServices; i++) {
          const additionalService = services[Math.floor(Math.random() * services.length)];
          selectedServices.push(additionalService);
          subtotal += additionalService.price;
        }

        const serviceItems = selectedServices.map(service => ({
          name: service.name,
          description: service.description || '',
          quantity: 1,
          unitPrice: service.price,
          totalPrice: service.price
        }));

        const tax = Math.round(subtotal * 0.16); // 16% tax
        const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0; // 10% discount sometimes
        const total = subtotal + tax - discount;

        // Randomly decide payment status
        const paymentRandom = Math.random();
        let paymentStatus, amountPaid, paymentMethod, paymentDate;

        if (paymentRandom > 0.8) {
          // 20% unpaid
          paymentStatus = PaymentStatus.PENDING;
          amountPaid = 0;
          paymentMethod = undefined;
          paymentDate = undefined;
        } else if (paymentRandom > 0.3) {
          // 50% fully paid
          paymentStatus = PaymentStatus.PAID;
          amountPaid = total;
          paymentMethod = Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.CREDIT_CARD;
          paymentDate = appointment.date;
        } else {
          // 30% partially paid
          paymentStatus = PaymentStatus.PARTIALLY_PAID;
          amountPaid = Math.round(total * (0.3 + Math.random() * 0.4)); // 30-70% paid
          paymentMethod = Math.random() > 0.5 ? PaymentMethod.CASH : PaymentMethod.CREDIT_CARD;
          paymentDate = appointment.date;
        }

        const balance = total - amountPaid;

        billings.push({
          patient: patient._id,
          appointment: appointment._id,
          invoiceNumber: generateInvoiceNumber(),
          date: appointment.date,
          dueDate: new Date(appointment.date.getTime() + (15 * 24 * 60 * 60 * 1000)), // 15 days later
          services: serviceItems,
          subtotal: subtotal,
          tax: tax,
          discount: discount,
          total: total,
          amountPaid: amountPaid,
          balance: balance,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,
          paymentDate: paymentDate,
          notes: paymentStatus === PaymentStatus.PAID ? 'Payment received in full' :
                 paymentStatus === PaymentStatus.PARTIALLY_PAID ? 'Partial payment received' : 'Payment pending',
          createdBy: admin._id
        });
      }
    }

    const createdBillings = await Billing.insertMany(billings);
    console.log(`✅ Created ${createdBillings.length} billings`);

    // Update patients with billing references
    for (const billing of createdBillings) {
      await Patient.findByIdAndUpdate(billing.patient, {
        $push: { billings: billing._id }
      });
    }

    return createdBillings;
  } catch (error) {
    console.error('❌ Error seeding billings:', error);
    throw error;
  }
};

// Seed Settings
const seedSettings = async () => {
  try {
    console.log('⚙️  Seeding settings...');

    const defaultSettings = {
      clinicName: 'Prime Skin Clinic',
      address: '123 Medical Plaza, Islamabad, Pakistan',
      phoneNumber: '+92 51 1234567',
      email: 'info@primeskinclinic.com',
      website: 'www.primeskinclinic.com',
      workingHours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '14:00' },
        sunday: { start: 'Closed', end: 'Closed' }
      },
      consultationFees: {
        initial: 3000,
        followUp: 2000
      },
      currency: 'PKR',
      taxRate: 16,
      notifications: {
        appointmentReminders: true,
        reminderHours: 24,
        smsEnabled: true,
        emailEnabled: true,
        prescriptionReady: true,
        paymentReceived: true
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'daily',
        backupTime: '02:00',
        retentionDays: 30
      },
      appointmentDuration: 60, // minutes
      appointmentBuffer: 15, // minutes between appointments
      logo: '/uploads/logo.png'
    };

    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      await Settings.findOneAndUpdate({}, defaultSettings);
      console.log('✅ Settings updated');
    } else {
      await Settings.create(defaultSettings);
      console.log('✅ Settings created');
    }

    return defaultSettings;
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  }
};

// Main seeder function
const runCentralSeeder = async () => {
  try {
    console.log('🚀 Starting Central Database Seeder...');
    console.log('=====================================');

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Seed data in order
    console.log('\n📊 Seeding core data...');
    const users = await seedUsers();
    const services = await seedServices();
    const settings = await seedSettings();

    console.log('\n👥 Seeding patient data...');
    const patients = await seedPatients();

    console.log('\n📅 Seeding appointment data...');
    const appointments = await seedAppointments(patients, users, services);

    console.log('\n💊 Seeding medical data...');
    const prescriptions = await seedPrescriptions(patients, users, appointments);

    // Skip visits for now due to encryption complexity
    console.log('⚠️  Skipping visits seeding (encryption setup required)');
    const visits: any[] = [];

    console.log('\n💰 Seeding financial data...');
    const billings = await seedBillings(patients, users, appointments, services);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('==========================================');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏥 Services: ${services.length}`);
    console.log(`👤 Patients: ${patients.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    console.log(`💊 Prescriptions: ${prescriptions.length}`);
    console.log(`🏥 Visits: ${visits.length}`);
    console.log(`💰 Billings: ${billings.length}`);
    console.log(`⚙️  Settings: Configured`);
    console.log('==========================================');

    console.log('\n🔐 Default Login Credentials:');
    console.log('Admin: admin@psc.com / Admin123!');
    console.log('Doctor: doctor@psc.com / Doctor123!');
    console.log('Receptionist: receptionist@psc.com / Reception123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error running central seeder:', error);
    process.exit(1);
  }
};

// Run the seeder
runCentralSeeder();
