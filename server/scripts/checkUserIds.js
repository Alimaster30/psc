const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Check for invalid user IDs
const checkUserIds = async () => {
  try {
    console.log('Checking user IDs in database...');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);
    
    let invalidCount = 0;
    let validCount = 0;
    
    users.forEach((user, index) => {
      const isValid = mongoose.Types.ObjectId.isValid(user._id) && 
                     (String)(new mongoose.Types.ObjectId(user._id)) === String(user._id);
      
      if (isValid) {
        validCount++;
        console.log(`✅ User ${index + 1}: ${user.firstName} ${user.lastName} - Valid ID: ${user._id}`);
      } else {
        invalidCount++;
        console.log(`❌ User ${index + 1}: ${user.firstName} ${user.lastName} - Invalid ID: ${user._id}`);
      }
    });
    
    console.log('\n=== SUMMARY ===');
    console.log(`Valid user IDs: ${validCount}`);
    console.log(`Invalid user IDs: ${invalidCount}`);
    
    if (invalidCount > 0) {
      console.log('\n⚠️  Found users with invalid IDs. These may cause "Invalid user ID" errors in the frontend.');
      console.log('Consider cleaning up or recreating these user records.');
    } else {
      console.log('\n✅ All user IDs are valid MongoDB ObjectIds.');
    }
    
  } catch (error) {
    console.error('Error checking user IDs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the check
const main = async () => {
  await connectDB();
  await checkUserIds();
};

main().catch(console.error);
