import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema({
  monday: { start: String, end: String },
  tuesday: { start: String, end: String },
  wednesday: { start: String, end: String },
  thursday: { start: String, end: String },
  friday: { start: String, end: String },
  saturday: { start: String, end: String },
  sunday: { start: String, end: String },
}, { _id: false });

const consultationFeesSchema = new mongoose.Schema({
  initial: Number,
  followUp: Number,
}, { _id: false });

const notificationSettingsSchema = new mongoose.Schema({
  appointmentReminders: Boolean,
  reminderHours: Number,
  smsEnabled: Boolean,
  emailEnabled: Boolean,
  prescriptionReady: Boolean,
  paymentReceived: Boolean,
}, { _id: false });

const backupSettingsSchema = new mongoose.Schema({
  autoBackup: Boolean,
  backupFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  backupTime: String,
  retentionDays: Number,
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  clinicName: String,
  address: String,
  phoneNumber: String,
  email: String,
  website: String,
  workingHours: workingHoursSchema,
  consultationFees: consultationFeesSchema,
  currency: String,
  taxRate: Number,
  notifications: notificationSettingsSchema,
  backup: backupSettingsSchema,
  appointmentDuration: Number,
  appointmentBuffer: Number,
  logo: String,
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema); 