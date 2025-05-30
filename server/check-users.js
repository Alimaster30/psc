const mongoose = require('mongoose');

// Import the actual User model
const User = require('./dist/models/user.model.js').default;

async function checkUsers() {
  try {
    await mongoose.connect('mongodb+srv://alit169533:Tahir123@cluster0.hmljfup.mongodb.net/pakskincare?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`- ${col.name}`));

    const users = await User.find({}).select('-password');
    console.log(`\nFound ${users.length} users in database:`);
    console.log('=====================================');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ID: ${user._id}`);
      console.log('   ---');
    });

    // Check specifically for Tahir Ali
    const tahirUser = await User.findOne({
      $or: [
        { firstName: 'Tahir', lastName: 'Ali' },
        { firstName: 'tahir', lastName: 'ali' },
        { firstName: 'Tahir Ali' },
        { email: { $regex: /tahir/i } }
      ]
    });

    if (tahirUser) {
      console.log('\n🎯 Found Tahir Ali user:');
      console.log(tahirUser);
    } else {
      console.log('\n❌ No user found with name Tahir Ali');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
