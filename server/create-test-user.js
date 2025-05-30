const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'receptionist', 'dermatologist'], default: 'receptionist' },
  isActive: { type: Boolean, default: true },
  phoneNumber: String,
  lastLogin: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
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

async function createTestUsers() {
  try {
    await mongoose.connect('mongodb+srv://alit169533:Tahir123@cluster0.hmljfup.mongodb.net/pakskincare?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB (pakskincare database)');
    
    // Clear existing users first
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create test users
    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@psc.com',
        password: 'Admin123!',
        role: 'admin',
        isActive: true
      },
      {
        firstName: 'Dr. Ali',
        lastName: 'Hassan',
        email: 'doctor@psc.com',
        password: 'Doctor123!',
        role: 'dermatologist',
        isActive: true
      },
      {
        firstName: 'Fatima',
        lastName: 'Khan',
        email: 'receptionist@psc.com',
        password: 'Reception123!',
        role: 'receptionist',
        isActive: true
      },
      {
        firstName: 'Tahir',
        lastName: 'Ali',
        email: 'tahir@psc.com',
        password: 'Tahir123!',
        role: 'admin',
        isActive: true,
        phoneNumber: '+92-300-1234567'
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Ahmed',
        email: 'sarah@psc.com',
        password: 'Sarah123!',
        role: 'dermatologist',
        isActive: true
      }
    ];
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    }
    
    // Verify users were created
    const allUsers = await User.find({}).select('-password');
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} (${user.role})`);
    });
    
    console.log('\n🎉 Test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUsers();
