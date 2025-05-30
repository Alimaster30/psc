import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import Patient from '../models/patient.model';
import Service from '../models/service.model';
import Appointment from '../models/appointment.model';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pakskincare');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

const testAppointmentCreation = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Get a patient
    const patient = await Patient.findOne();
    if (!patient) {
      console.error('No patients found in the database');
      return;
    }
    console.log('Using patient:', patient._id);

    // Get a dermatologist
    const dermatologist = await User.findOne({ role: 'dermatologist' });
    if (!dermatologist) {
      console.error('No dermatologists found in the database');
      return;
    }
    console.log('Using dermatologist:', dermatologist._id);

    // Get a service
    const service = await Service.findOne();
    if (!service) {
      console.error('No services found in the database');
      return;
    }
    console.log('Using service:', service._id);

    // Create appointment data
    const appointmentData = {
      patient: patient._id,
      dermatologist: dermatologist._id,
      service: service._id,
      date: '2025-05-12',
      startTime: '10:00 AM',
      endTime: '10:30 AM',
      reason: 'Test appointment',
      notes: 'Test notes',
      createdBy: dermatologist._id // This is required by the model
    };

    console.log('Appointment data:', appointmentData);

    // Make the API call
    try {
      // Direct database insertion to bypass authentication
      const appointment = new Appointment(appointmentData);
      const savedAppointment = await appointment.save();
      console.log('Appointment created successfully:', savedAppointment);

      // Alternatively, if you want to use the API:
      /*
      const response = await axios.post('http://localhost:8080/api/appointments', appointmentData, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed
          'Authorization': 'Bearer YOUR_VALID_TOKEN'
        }
      });
      console.log('Appointment created successfully:', response.data);
      */

    } catch (error: any) {
      console.error('Error creating appointment:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }

    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error in test script:', error);
  }
};

// Run the test
testAppointmentCreation();
