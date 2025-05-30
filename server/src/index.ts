import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import prescriptionRoutes from './routes/prescription.routes';
import billingRoutes from './routes/billing.routes';
import analyticsRoutes from './routes/analytics.routes';
import settingsRoutes from './routes/settings.routes';
import backupRoutes from './routes/backup.routes';
import serviceRoutes from './routes/service.routes';

// Import error handler
import { errorHandler } from './middlewares/error.middleware';

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Rate limiting - Increased limits for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 200, // Limit each IP to 200 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Dermatology Clinic Management System API');
});

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/services', serviceRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
