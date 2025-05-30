const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
async function connectDB() {
  await mongoose.connect('mongodb+srv://alit169533:Tahir123@cluster0.hmljfup.mongodb.net/pakskincare?retryWrites=true&w=majority&appName=Cluster0');
  console.log('Connected to MongoDB (pakskincare database)');
}

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  phoneNumber: String,
  lastLogin: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Patient Schema
const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  medicalHistory: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  }
}, { timestamps: true });

// Service Schema
const serviceSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  duration: Number,
  category: String,
  isActive: Boolean
}, { timestamps: true });

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  dermatologist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  date: Date,
  time: String,
  status: String,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Billing Schema
const billingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  services: [{
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paidAmount: Number,
  status: String,
  paymentMethod: String,
  invoiceNumber: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Models
const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Service = mongoose.model('Service', serviceSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Billing = mongoose.model('Billing', billingSchema);

async function seedData() {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    await Billing.deleteMany({});
    console.log('Cleared existing data');
    
    // Create Users
    const users = await User.create([
      { firstName: 'Admin', lastName: 'User', email: 'admin@psc.com', password: 'Admin123!', role: 'admin', isActive: true },
      { firstName: 'Dr. Ali', lastName: 'Hassan', email: 'doctor@psc.com', password: 'Doctor123!', role: 'dermatologist', isActive: true },
      { firstName: 'Fatima', lastName: 'Khan', email: 'receptionist@psc.com', password: 'Reception123!', role: 'receptionist', isActive: true },
      { firstName: 'Tahir', lastName: 'Ali', email: 'tahir@psc.com', password: 'Tahir123!', role: 'admin', isActive: true, phoneNumber: '+92-300-1234567' },
      { firstName: 'Dr. Sarah', lastName: 'Ahmed', email: 'sarah@psc.com', password: 'Sarah123!', role: 'dermatologist', isActive: true }
    ]);
    console.log(`✅ Created ${users.length} users`);
    
    // Create Services
    const services = await Service.create([
      { name: 'Acne Treatment', description: 'Comprehensive acne treatment', price: 5000, duration: 60, category: 'Treatment', isActive: true },
      { name: 'Skin Consultation', description: 'General skin consultation', price: 2000, duration: 30, category: 'Consultation', isActive: true },
      { name: 'Chemical Peel', description: 'Professional chemical peel', price: 8000, duration: 90, category: 'Treatment', isActive: true },
      { name: 'Laser Treatment', description: 'Laser skin treatment', price: 15000, duration: 120, category: 'Treatment', isActive: true },
      { name: 'Botox Injection', description: 'Botox treatment', price: 25000, duration: 45, category: 'Cosmetic', isActive: true }
    ]);
    console.log(`✅ Created ${services.length} services`);
    
    // Create Patients
    const patients = await Patient.create([
      { firstName: 'Ahmed', lastName: 'Khan', email: 'ahmed@example.com', phoneNumber: '+92-300-1111111', dateOfBirth: new Date('1990-01-15'), gender: 'Male', address: 'Lahore, Pakistan' },
      { firstName: 'Ayesha', lastName: 'Malik', email: 'ayesha@example.com', phoneNumber: '+92-300-2222222', dateOfBirth: new Date('1985-05-20'), gender: 'Female', address: 'Karachi, Pakistan' },
      { firstName: 'Hassan', lastName: 'Ali', email: 'hassan@example.com', phoneNumber: '+92-300-3333333', dateOfBirth: new Date('1992-08-10'), gender: 'Male', address: 'Islamabad, Pakistan' },
      { firstName: 'Zara', lastName: 'Sheikh', email: 'zara@example.com', phoneNumber: '+92-300-4444444', dateOfBirth: new Date('1988-12-05'), gender: 'Female', address: 'Faisalabad, Pakistan' },
      { firstName: 'Omar', lastName: 'Farooq', email: 'omar@example.com', phoneNumber: '+92-300-5555555', dateOfBirth: new Date('1995-03-25'), gender: 'Male', address: 'Multan, Pakistan' }
    ]);
    console.log(`✅ Created ${patients.length} patients`);
    
    // Create Appointments
    const appointments = [];
    for (let i = 0; i < 15; i++) {
      const appointment = await Appointment.create({
        patient: patients[i % patients.length]._id,
        dermatologist: users.filter(u => u.role === 'dermatologist')[i % 2]._id,
        service: services[i % services.length]._id,
        date: new Date(Date.now() + (i - 7) * 24 * 60 * 60 * 1000), // Spread across 2 weeks
        time: ['09:00', '10:00', '11:00', '14:00', '15:00'][i % 5],
        status: ['scheduled', 'completed', 'cancelled'][i % 3],
        notes: `Appointment notes for patient ${i + 1}`,
        createdBy: users.find(u => u.role === 'receptionist')._id
      });
      appointments.push(appointment);
    }
    console.log(`✅ Created ${appointments.length} appointments`);
    
    // Create Billing records
    const billings = [];
    for (let i = 0; i < 10; i++) {
      const appointment = appointments[i];
      const service = services[i % services.length];
      const billing = await Billing.create({
        patient: appointment.patient,
        appointment: appointment._id,
        services: [{
          service: service._id,
          quantity: 1,
          price: service.price
        }],
        totalAmount: service.price,
        paidAmount: service.price,
        status: 'paid',
        paymentMethod: ['cash', 'card', 'bank_transfer'][i % 3],
        invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
        createdBy: users.find(u => u.role === 'receptionist')._id
      });
      billings.push(billing);
    }
    console.log(`✅ Created ${billings.length} billing records`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Appointments: ${appointments.length}`);
    console.log(`   - Billing Records: ${billings.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();
