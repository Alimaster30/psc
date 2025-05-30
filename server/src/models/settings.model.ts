import mongoose, { Document } from 'mongoose';

export interface IWorkingHours {
  monday: { start: string; end: string };
  tuesday: { start: string; end: string };
  wednesday: { start: string; end: string };
  thursday: { start: string; end: string };
  friday: { start: string; end: string };
  saturday: { start: string; end: string };
  sunday: { start: string; end: string };
}

export interface IConsultationFees {
  initial: number;
  followUp: number;
}

export interface INotificationSettings {
  appointmentReminders: boolean;
  reminderHours: number;
  smsEnabled: boolean;
  emailEnabled: boolean;
  prescriptionReady: boolean;
  paymentReceived: boolean;
}

export interface IBackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionDays: number;
}

export interface ISettings extends Document {
  clinicName: string;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
  workingHours: IWorkingHours;
  consultationFees: IConsultationFees;
  currency: string;
  taxRate: number;
  notifications: INotificationSettings;
  backup: IBackupSettings;
  appointmentDuration: number;
  appointmentBuffer: number;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}

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

const settingsSchema = new mongoose.Schema<ISettings>({
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

export default mongoose.model<ISettings>('Settings', settingsSchema);