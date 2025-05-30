const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function testUser() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://alit169533:Tahir123@cluster0.hmljfup.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB Atlas');

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@psc.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user does not exist!');
      
      // Create admin user
      console.log('Creating admin user...');
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@psc.com',
        password: 'Admin123!',
        role: 'admin',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user exists!');
      console.log('User details:', {
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
      
      // Test password
      const isPasswordCorrect = await adminUser.comparePassword('Admin123!');
      console.log('Password test result:', isPasswordCorrect ? '✅ Correct' : '❌ Incorrect');
    }

    // List all users
    const allUsers = await User.find({}, 'email role isActive');
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testUser();
