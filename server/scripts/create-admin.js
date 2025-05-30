const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pakskincare')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Define User Schema (simplified version of the TypeScript model)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    type: String,
    enum: ['admin', 'receptionist', 'dermatologist'],
    default: 'receptionist'
  },
  phoneNumber: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@psc.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@psc.com',
      password: 'password123',
      role: 'admin',
      phoneNumber: '+923001234567',
      isActive: true
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    
    // Create dermatologist user
    const dermatologistExists = await User.findOne({ email: 'doctor@psc.com' });
    
    if (!dermatologistExists) {
      const dermatologist = new User({
        firstName: 'Doctor',
        lastName: 'User',
        email: 'doctor@psc.com',
        password: 'password123',
        role: 'dermatologist',
        phoneNumber: '+923001234568',
        isActive: true
      });
      
      await dermatologist.save();
      console.log('Dermatologist user created successfully');
    }
    
    // Create receptionist user
    const receptionistExists = await User.findOne({ email: 'receptionist@psc.com' });
    
    if (!receptionistExists) {
      const receptionist = new User({
        firstName: 'Receptionist',
        lastName: 'User',
        email: 'receptionist@psc.com',
        password: 'password123',
        role: 'receptionist',
        phoneNumber: '+923001234569',
        isActive: true
      });
      
      await receptionist.save();
      console.log('Receptionist user created successfully');
    }
    
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
}

// Run the function
createAdminUser();
