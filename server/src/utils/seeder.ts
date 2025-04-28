import mongoose from 'mongoose';
import User, { UserRole } from '../models/user.model';
import dotenv from 'dotenv';

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

// Seed users
const seedUsers = async () => {
  try {
    // Define default users
    const defaultUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@pakskincare.com',
        password: 'Admin123!',
        role: UserRole.ADMIN,
        isActive: true,
      },
      {
        firstName: 'Dr',
        lastName: 'Dermatologist',
        email: 'doctor@pakskincare.com',
        password: 'Doctor123!',
        role: UserRole.DERMATOLOGIST,
        isActive: true,
      },
      {
        firstName: 'Front',
        lastName: 'Desk',
        email: 'receptionist@pakskincare.com',
        password: 'Reception123!',
        role: UserRole.RECEPTIONIST,
        isActive: true,
      }
    ];

    // Create users if they don't exist
    for (const userData of defaultUsers) {
      const userExists = await User.findOne({ email: userData.email });

      if (!userExists) {
        await User.create(userData);
        console.log(`${userData.role} user created successfully: ${userData.email}`);
      } else {
        console.log(`${userData.role} user already exists: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Run seeder
const runSeeder = async () => {
  try {
    await connectDB();
    await seedUsers();
    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeeder();