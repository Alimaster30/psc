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
import patientImageRoutes from './routes/patientImage.routes';
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

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://prime-skin-clinic-frontend.onrender.com',
        'https://prime-skin-clinic-api.onrender.com',
        process.env.CORS_ORIGIN || 'https://prime-skin-clinic-frontend.onrender.com'
      ].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Health check endpoint for Render
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test endpoint to check uploads directory
app.get('/api/test-uploads', (req: Request, res: Response) => {
  const fs = require('fs');
  const path = require('path');

  const uploadsDir = path.join(__dirname, '../uploads');
  const patientImagesDir = path.join(uploadsDir, 'patient-images');

  try {
    const uploadsExists = fs.existsSync(uploadsDir);
    const patientImagesExists = fs.existsSync(patientImagesDir);

    let files = [];
    if (patientImagesExists) {
      files = fs.readdirSync(patientImagesDir);
    }

    res.json({
      uploadsDir,
      patientImagesDir,
      uploadsExists,
      patientImagesExists,
      files,
      sampleImageUrl: files.length > 0 ? `/uploads/patient-images/${files[0]}` : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test HTML page to debug image loading
app.get('/test-images', (req: Request, res: Response) => {
  const fs = require('fs');
  const path = require('path');

  const patientImagesDir = path.join(__dirname, '../uploads/patient-images');
  let files = [];

  if (fs.existsSync(patientImagesDir)) {
    files = fs.readdirSync(patientImagesDir);
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Image Test</title>
    </head>
    <body>
      <h1>Image Loading Test</h1>
      ${files.map((file: string) => `
        <div style="margin: 20px; border: 1px solid #ccc; padding: 10px;">
          <h3>${file}</h3>
          <p>URL: /uploads/patient-images/${file}</p>
          <img src="/uploads/patient-images/${file}" style="max-width: 300px;"
               onload="console.log('✅ Image loaded:', '${file}')"
               onerror="console.error('❌ Image failed:', '${file}')">
        </div>
      `).join('')}
    </body>
    </html>
  `;

  res.send(html);
});



// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patient-images', patientImageRoutes);
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
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS Origins:`, corsOptions.origin);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
    console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
  });
});
