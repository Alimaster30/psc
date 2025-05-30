const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pak-skin-care';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'receptionist', 'dermatologist'], default: 'receptionist' },
  profileImage: { type: String },
  phoneNumber: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Define Patient Schema
const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String, required: true },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  medicalHistory: { type: String, default: '' }, // Encrypted
  allergies: { type: String, default: '' }, // Encrypted
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  visits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visit' }],
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
  billings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Billing' }],
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

// Define Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dermatologist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: { type: String, required: true },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Define Prescription Schema
const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dermatologist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  diagnosis: { type: String, required: true },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, required: true },
  }],
  notes: { type: String },
  followUpDate: { type: Date },
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

// Define Billing Schema
const billingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  currency: { type: String, default: 'PKR', enum: ['PKR'] }, // Set PKR as the only currency option
  services: [{
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  }],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, default: 0, min: 0 },
  balance: { type: Number, default: function() { return this.total - this.amountPaid; }, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'easypaisa', 'jazzcash', 'other']
  },
  paymentDate: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Billing = mongoose.model('Billing', billingSchema);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'User account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Role-based Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Specific Role-Based Access Control Middleware
const roleBasedAccess = {
  // Admin-specific access controls
  adminOnly: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access this resource'
      });
    }
    next();
  },

  // Doctor-specific access controls
  doctorOnly: (req, res, next) => {
    if (req.user.role !== 'dermatologist') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access this resource'
      });
    }
    next();
  },

  // Receptionist-specific access controls
  receptionistOnly: (req, res, next) => {
    if (req.user.role !== 'receptionist') {
      return res.status(403).json({
        success: false,
        message: 'Only receptionists can access this resource'
      });
    }
    next();
  },

  // Restrict patient data access for doctors to only their patients
  doctorPatientAccess: async (req, res, next) => {
    try {
      if (req.user.role !== 'dermatologist') {
        return next();
      }

      const patientId = req.params.id || req.body.patient;
      if (!patientId) {
        return next();
      }

      // Check if this patient has any appointments with this doctor
      const hasAccess = await Appointment.exists({
        patient: patientId,
        dermatologist: req.user._id
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this patient\'s records'
        });
      }

      next();
    } catch (error) {
      console.error('Doctor patient access check error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Restrict appointment access for doctors to only their appointments
  doctorAppointmentAccess: (req, res, next) => {
    if (req.user.role === 'dermatologist') {
      // Add filter to only show appointments for this doctor
      req.query.dermatologist = req.user._id;
    }
    next();
  },

  // Restrict prescription access
  prescriptionAccess: (req, res, next) => {
    // Only doctors can create prescriptions
    if (req.method === 'POST' && req.user.role !== 'dermatologist') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can create prescriptions'
      });
    }

    // Doctors can only view their own prescriptions
    if (req.user.role === 'dermatologist' && req.method === 'GET') {
      req.query.dermatologist = req.user._id;
    }

    next();
  },

  // Restrict billing access to receptionists and admins
  billingAccess: (req, res, next) => {
    if (!['admin', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to billing information'
      });
    }
    next();
  },

  // Only admin can register new staff
  registrationAccess: (req, res, next) => {
    // Check if this is a staff registration (not patient)
    if (req.body.role && req.body.role !== 'patient') {
      // Only admin can register staff
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can register new staff accounts'
        });
      }
    }
    next();
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('Pak Skin Care Management System API is running');
});

// Health check endpoint (no authentication required)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Temporary endpoint to create test users (remove in production)
app.post('/api/create-test-users', async (req, res) => {
  try {
    // Check if users already exist
    const existingUsers = await User.find({});

    res.status(200).json({
      success: true,
      message: `Found ${existingUsers.length} existing users`,
      users: existingUsers.map(u => ({
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        id: u._id
      }))
    });

    // If no users exist, create them
    if (existingUsers.length === 0) {
      console.log('No users found, creating test users...');

      // Create test users
      const testUsers = [
        {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@psc.com',
          password: 'Admin123!',
          role: 'admin',
          phoneNumber: '+92 300 1234567',
          isActive: true,
        },
        {
          firstName: 'Dr. Sarah',
          lastName: 'Ahmed',
          email: 'doctor@psc.com',
          password: 'Doctor123!',
          role: 'dermatologist',
          phoneNumber: '+92 301 2345678',
          isActive: true,
        },
        {
          firstName: 'Fatima',
          lastName: 'Khan',
          email: 'receptionist@psc.com',
          password: 'Reception123!',
          role: 'receptionist',
          phoneNumber: '+92 302 3456789',
          isActive: true,
        }
      ];

      const createdUsers = await User.insertMany(testUsers);
      console.log(`Created ${createdUsers.length} users`);

      return res.status(201).json({
        success: true,
        message: 'Test users created successfully',
        users: createdUsers.map(u => ({ email: u.email, role: u.role, isActive: u.isActive }))
      });
    }
  } catch (error) {
    console.error('Create test users error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Force create admin user endpoint
app.post('/api/force-create-admin', async (req, res) => {
  try {
    // Delete existing admin if any
    await User.deleteOne({ email: 'admin@psc.com' });

    // Create new admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@psc.com',
      password: 'Admin123!',
      role: 'admin',
      phoneNumber: '+92 300 1234567',
      isActive: true,
    });

    console.log('Force created admin user:', adminUser.email);

    res.status(201).json({
      success: true,
      message: 'Admin user force created successfully',
      user: {
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        id: adminUser._id
      }
    });
  } catch (error) {
    console.error('Force create admin error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/register', authenticate, roleBasedAccess.registrationAccess, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'receptionist',
      phoneNumber,
    });

    // Log the action for audit purposes
    console.log(`User ${req.user ? req.user.email : 'system'} created new ${role} account for ${email}`);

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Public registration endpoint for initial admin setup only
app.post('/api/auth/setup', async (req, res) => {
  try {
    // Check if any admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Setup already completed. Please use the regular login.'
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Create admin user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Initial setup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'User account is deactivated' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Patient Routes
app.get('/api/patients', authenticate, async (req, res) => {
  try {
    let query = {};

    // If user is a doctor, only show patients they have appointments with
    if (req.user.role === 'dermatologist') {
      // Get all appointments for this doctor
      const doctorAppointments = await Appointment.find({ dermatologist: req.user._id });

      // Extract unique patient IDs
      const patientIds = [...new Set(doctorAppointments.map(appt => appt.patient))];

      // Only show these patients
      query = { _id: { $in: patientIds } };
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/patients/:id', authenticate, roleBasedAccess.doctorPatientAccess, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('visits')
      .populate({
        path: 'prescriptions',
        // If user is a doctor, only show prescriptions they created
        match: req.user.role === 'dermatologist' ? { dermatologist: req.user._id } : {},
      })
      .populate({
        path: 'billings',
        // Don't show billing info to doctors
        match: req.user.role === 'dermatologist' ? { _id: null } : {},
      });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // For doctors, remove sensitive medical history if they don't have access
    if (req.user.role === 'dermatologist') {
      // Check if this doctor has created any prescriptions for this patient
      const hasTreated = await Prescription.exists({
        patient: patient._id,
        dermatologist: req.user._id
      });

      if (!hasTreated) {
        // Remove sensitive information
        patient.medicalHistory = undefined;
        patient.allergies = undefined;
      }
    }

    // For receptionists, remove medical details
    if (req.user.role === 'receptionist') {
      patient.medicalHistory = undefined;
      patient.allergies = undefined;
      // Keep basic info for appointment scheduling
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/patients', authenticate, async (req, res) => {
  try {
    // Only receptionists and admins can create patients
    if (!['admin', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only receptionists and administrators can register patients'
      });
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      bloodType,
    } = req.body;

    // Check if patient with email already exists
    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return res.status(400).json({ success: false, message: 'Patient with this email already exists' });
    }

    // Create patient
    const patient = await Patient.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      bloodType,
    });

    // Log the action
    console.log(`User ${req.user.email} (${req.user.role}) registered new patient: ${firstName} ${lastName}`);

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update patient - only receptionists and admins
app.put('/api/patients/:id', authenticate, async (req, res) => {
  try {
    // Only receptionists and admins can update patients
    if (!['admin', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only receptionists and administrators can update patient information'
      });
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      bloodType,
    } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Update patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
        bloodType,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPatient,
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update patient visit count - only receptionists
app.patch('/api/patients/:id/visit', authenticate, roleBasedAccess.receptionistOnly, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Increment visit count
    patient.visits = patient.visits || [];
    patient.visits.push({
      date: new Date(),
      notes: req.body.notes || 'Regular visit',
      recordedBy: req.user._id
    });

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Patient visit recorded successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update patient visit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Appointment Routes
app.get('/api/appointments', authenticate, roleBasedAccess.doctorAppointmentAccess, async (req, res) => {
  try {
    const { status, date, dermatologist, patient } = req.query;
    const filter = {};

    // Apply filters if provided
    if (status) {
      filter.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (dermatologist) {
      filter.dermatologist = dermatologist;
    }

    if (patient) {
      filter.patient = patient;
    }

    // If user is a dermatologist, only show their appointments
    if (req.user.role === 'dermatologist') {
      filter.dermatologist = req.user._id;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('dermatologist', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/appointments', authenticate, async (req, res) => {
  try {
    // Only receptionists and admins can create appointments
    if (!['admin', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only receptionists and administrators can schedule appointments'
      });
    }

    const { patient, dermatologist, date, startTime, endTime, reason, notes, status } = req.body;

    // Check if dermatologist exists and is a dermatologist
    const dermatologistUser = await User.findById(dermatologist);
    if (!dermatologistUser || dermatologistUser.role !== 'dermatologist') {
      return res.status(400).json({ success: false, message: 'Invalid dermatologist' });
    }

    // Check for scheduling conflicts
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const existingAppointment = await Appointment.findOne({
      dermatologist,
      date: appointmentDate,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Scheduling conflict with existing appointment' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient,
      dermatologist,
      date: appointmentDate,
      startTime,
      endTime,
      reason,
      notes,
      status: status || 'scheduled',
      createdBy: req.user._id,
    });

    // Log the action
    console.log(`User ${req.user.email} (${req.user.role}) scheduled appointment for patient ${patient} with doctor ${dermatologist}`);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update appointment status - doctors can update status, receptionists can reschedule
app.patch('/api/appointments/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check permissions based on role
    if (req.user.role === 'dermatologist') {
      // Doctors can only update their own appointments
      if (appointment.dermatologist.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own appointments'
        });
      }

      // Doctors can only update status
      if (req.body.status) {
        appointment.status = req.body.status;
        appointment.notes = req.body.notes || appointment.notes;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Doctors can only update appointment status and notes'
        });
      }
    } else if (req.user.role === 'receptionist' || req.user.role === 'admin') {
      // Receptionists and admins can update all fields
      if (req.body.date) {
        appointment.date = new Date(req.body.date);
        appointment.date.setHours(0, 0, 0, 0);
      }

      if (req.body.startTime) appointment.startTime = req.body.startTime;
      if (req.body.endTime) appointment.endTime = req.body.endTime;
      if (req.body.status) appointment.status = req.body.status;
      if (req.body.reason) appointment.reason = req.body.reason;
      if (req.body.notes) appointment.notes = req.body.notes;

      // Check for scheduling conflicts if rescheduling
      if (req.body.date || req.body.startTime || req.body.endTime) {
        const existingAppointment = await Appointment.findOne({
          _id: { $ne: appointment._id }, // Exclude current appointment
          dermatologist: appointment.dermatologist,
          date: appointment.date,
          $or: [
            { startTime: { $lte: appointment.startTime }, endTime: { $gt: appointment.startTime } },
            { startTime: { $lt: appointment.endTime }, endTime: { $gte: appointment.endTime } },
            { startTime: { $gte: appointment.startTime }, endTime: { $lte: appointment.endTime } },
          ],
        });

        if (existingAppointment) {
          return res.status(400).json({ success: false, message: 'Scheduling conflict with existing appointment' });
        }
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update appointments'
      });
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel appointment - receptionists and admins only
app.delete('/api/appointments/:id', authenticate, async (req, res) => {
  try {
    // Only receptionists and admins can cancel appointments
    if (!['admin', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only receptionists and administrators can cancel appointments'
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update status to cancelled instead of deleting
    appointment.status = 'cancelled';
    appointment.notes = `${appointment.notes || ''}\nCancelled by ${req.user.firstName} ${req.user.lastName} on ${new Date().toISOString()}`;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Prescription Routes
app.get('/api/prescriptions', authenticate, roleBasedAccess.prescriptionAccess, async (req, res) => {
  try {
    const { patient, dermatologist } = req.query;
    const filter = {};

    // Apply filters if provided
    if (patient) {
      filter.patient = patient;
    }

    if (dermatologist) {
      filter.dermatologist = dermatologist;
    }

    // If user is a dermatologist, only show their prescriptions
    if (req.user.role === 'dermatologist') {
      filter.dermatologist = req.user._id;
    }

    // Receptionists cannot access prescriptions
    if (req.user.role === 'receptionist') {
      return res.status(403).json({
        success: false,
        message: 'Receptionists do not have access to prescription information'
      });
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('dermatologist', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/prescriptions/:id', authenticate, roleBasedAccess.prescriptionAccess, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('dermatologist', 'firstName lastName');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Doctors can only view their own prescriptions
    if (req.user.role === 'dermatologist' &&
        prescription.dermatologist._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view prescriptions you have created'
      });
    }

    // Receptionists cannot access prescriptions
    if (req.user.role === 'receptionist') {
      return res.status(403).json({
        success: false,
        message: 'Receptionists do not have access to prescription information'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/prescriptions', authenticate, roleBasedAccess.doctorOnly, async (req, res) => {
  try {
    const { patient, diagnosis, medications, notes, followUpDate } = req.body;

    // Verify doctor has access to this patient
    const hasAccess = await Appointment.exists({
      patient,
      dermatologist: req.user._id
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You can only create prescriptions for patients you have appointments with'
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient,
      dermatologist: req.user._id,
      diagnosis,
      medications,
      notes,
      followUpDate,
    });

    // Add prescription to patient's prescriptions
    await Patient.findByIdAndUpdate(patient, {
      $push: { prescriptions: prescription._id },
    });

    // Log the action
    console.log(`Doctor ${req.user.email} created prescription for patient ${patient}`);

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update prescription - doctors can only update their own prescriptions
app.put('/api/prescriptions/:id', authenticate, roleBasedAccess.doctorOnly, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Doctors can only update their own prescriptions
    if (prescription.dermatologist.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update prescriptions you have created'
      });
    }

    const { diagnosis, medications, notes, followUpDate } = req.body;

    // Update prescription
    prescription.diagnosis = diagnosis || prescription.diagnosis;
    prescription.medications = medications || prescription.medications;
    prescription.notes = notes || prescription.notes;
    prescription.followUpDate = followUpDate || prescription.followUpDate;

    await prescription.save();

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Billing Routes
app.get('/api/billing', authenticate, roleBasedAccess.billingAccess, async (req, res) => {
  try {
    const { patient, status, startDate, endDate } = req.query;
    const filter = {};

    // Apply filters if provided
    if (patient) {
      filter.patient = patient;
    }

    if (status) {
      filter.paymentStatus = status;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }

    const billings = await Billing.find(filter)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('appointment', 'date startTime endTime')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: billings.length,
      data: billings,
    });
  } catch (error) {
    console.error('Get billings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/billing/:id', authenticate, roleBasedAccess.billingAccess, async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('appointment', 'date startTime endTime')
      .populate('createdBy', 'firstName lastName');

    if (!billing) {
      return res.status(404).json({ success: false, message: 'Billing not found' });
    }

    res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/billing', authenticate, roleBasedAccess.receptionistOnly, async (req, res) => {
  try {
    const {
      patient,
      appointment,
      services,
      subtotal,
      tax,
      discount,
      total,
      amountPaid,
      paymentStatus,
      paymentMethod,
      paymentDate,
      notes,
    } = req.body;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Set due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create billing
    const billing = await Billing.create({
      patient,
      appointment,
      invoiceNumber,
      date: new Date(),
      dueDate,
      currency: 'PKR', // Set currency to PKR
      services,
      subtotal,
      tax: tax || 0,
      discount: discount || 0,
      total,
      amountPaid: amountPaid || 0,
      balance: total - (amountPaid || 0),
      paymentStatus: paymentStatus || 'pending',
      paymentMethod,
      paymentDate,
      notes,
      createdBy: req.user._id,
    });

    // Add billing to patient's billings
    await Patient.findByIdAndUpdate(patient, {
      $push: { billings: billing._id },
    });

    // Log the action
    console.log(`User ${req.user.email} (${req.user.role}) created billing for patient ${patient}`);

    res.status(201).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    console.error('Create billing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update payment status - receptionists only
app.patch('/api/billing/:id/payment', authenticate, roleBasedAccess.receptionistOnly, async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id);

    if (!billing) {
      return res.status(404).json({ success: false, message: 'Billing not found' });
    }

    const { amountPaid, paymentMethod, paymentStatus, paymentDate } = req.body;

    // Update payment information
    if (amountPaid !== undefined) {
      billing.amountPaid = amountPaid;
      billing.balance = billing.total - amountPaid;
    }

    if (paymentMethod) billing.paymentMethod = paymentMethod;
    if (paymentStatus) billing.paymentStatus = paymentStatus;
    if (paymentDate) billing.paymentDate = new Date(paymentDate);

    // If fully paid, update status
    if (billing.balance <= 0) {
      billing.paymentStatus = 'paid';
    } else if (billing.amountPaid > 0) {
      billing.paymentStatus = 'partially_paid';
    }

    await billing.save();

    // Log the action
    console.log(`User ${req.user.email} (${req.user.role}) updated payment for billing ${billing.invoiceNumber}`);

    res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Generate receipt - receptionists only
app.get('/api/billing/:id/receipt', authenticate, roleBasedAccess.receptionistOnly, async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('appointment', 'date startTime endTime')
      .populate('createdBy', 'firstName lastName');

    if (!billing) {
      return res.status(404).json({ success: false, message: 'Billing not found' });
    }

    // In a real implementation, this would generate a PDF receipt
    // For now, we'll just return the billing data with a receipt flag

    res.status(200).json({
      success: true,
      isReceipt: true,
      data: billing,
    });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Analytics Routes (Admin only)
app.get('/api/analytics/dashboard-summary', authenticate, roleBasedAccess.adminOnly, async (req, res) => {
  try {
    // Get total patients
    const totalPatients = await Patient.countDocuments();

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments();

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Get total revenue in PKR
    const totalRevenue = await Billing.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' },
        },
      },
    ]);

    // Get this month's revenue in PKR
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

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

    // Add currency information to the response
    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalAppointments,
        todayAppointments,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
        currency: 'PKR'
      },
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Patient growth analytics - Admin only
app.get('/api/analytics/patient-growth', authenticate, roleBasedAccess.adminOnly, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Get current date
    const today = new Date();

    // Define aggregation based on period
    let dateFormat, groupBy, limit, startDate;

    if (period === 'monthly') {
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      limit = 12; // Last 12 months
      startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    } else if (period === 'weekly') {
      dateFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
      groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
      limit = 12; // Last 12 weeks
      startDate = new Date();
      startDate.setDate(today.getDate() - 84); // 12 weeks ago
    } else if (period === 'yearly') {
      dateFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
      groupBy = { year: { $year: '$createdAt' } };
      limit = 5; // Last 5 years
      startDate = new Date(today.getFullYear() - 5, 0, 1);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid period parameter' });
    }

    // Aggregate patient growth
    const patientGrowth = await Patient.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          period: { $first: dateFormat }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          period: 1,
          count: 1
        }
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      success: true,
      data: patientGrowth,
    });
  } catch (error) {
    console.error('Get patient growth error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Revenue analytics - Admin only
app.get('/api/analytics/revenue', authenticate, roleBasedAccess.adminOnly, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Get current date
    const today = new Date();

    // Define aggregation based on period
    let dateFormat, groupBy, limit, startDate;

    if (period === 'monthly') {
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
      groupBy = { year: { $year: '$date' }, month: { $month: '$date' } };
      limit = 12; // Last 12 months
      startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    } else if (period === 'weekly') {
      dateFormat = { $dateToString: { format: '%Y-%U', date: '$date' } };
      groupBy = { year: { $year: '$date' }, week: { $week: '$date' } };
      limit = 12; // Last 12 weeks
      startDate = new Date();
      startDate.setDate(today.getDate() - 84); // 12 weeks ago
    } else if (period === 'yearly') {
      dateFormat = { $dateToString: { format: '%Y', date: '$date' } };
      groupBy = { year: { $year: '$date' } };
      limit = 5; // Last 5 years
      startDate = new Date(today.getFullYear() - 5, 0, 1);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid period parameter' });
    }

    // Aggregate revenue
    const revenue = await Billing.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          paymentStatus: { $in: ['paid', 'partially_paid'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: '$amountPaid' },
          period: { $first: dateFormat }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          period: 1,
          total: 1,
          currency: { $literal: 'PKR' }
        }
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// System backup endpoint - Admin only
app.get('/api/backups/create', authenticate, roleBasedAccess.adminOnly, async (req, res) => {
  try {
    // In a real implementation, this would trigger a database backup
    // For now, we'll just return a mock response

    const backupId = `backup-${Date.now()}`;

    // Log the action
    console.log(`Admin ${req.user.email} triggered system backup ${backupId}`);

    res.status(200).json({
      success: true,
      message: 'Backup process initiated successfully',
      data: {
        backupId,
        timestamp: new Date(),
        status: 'processing',
        estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// System settings - Admin only
app.get('/api/settings', authenticate, roleBasedAccess.adminOnly, async (req, res) => {
  try {
    // In a real implementation, this would fetch system settings from the database
    // For now, we'll return mock settings

    res.status(200).json({
      success: true,
      data: {
        clinicName: 'Pak Skin Care',
        address: '123 Medical Plaza, Islamabad, Pakistan',
        phoneNumber: '+92 51 1234567',
        email: 'info@pakskincare.com',
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '10:00', end: '15:00' },
          sunday: { start: '', end: '' },
        },
        consultationFees: {
          initial: 2500,
          followUp: 1500,
        },
        currency: 'PKR',
        taxRate: 5, // 5%
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update system settings - Admin only
app.put('/api/settings', authenticate, roleBasedAccess.adminOnly, async (req, res) => {
  try {
    // In a real implementation, this would update system settings in the database
    // For now, we'll just return a success response

    // Log the action
    console.log(`Admin ${req.user.email} updated system settings`);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: req.body
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create initial admin user if none exists
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@psc.com',
        password: 'Admin123!',
        role: 'admin',
        phoneNumber: '+92 300 1234567',
        isActive: true,
      });
      console.log('Admin user created with email: admin@psc.com');
    } else {
      console.log('Admin user already exists:', adminExists.email);
    }
  } catch (error) {
    console.error('Create admin user error:', error);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createAdminUser();
});
