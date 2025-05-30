import mongoose, { Document, Schema } from 'mongoose';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
}

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  dermatologist: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    dermatologist: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dermatologist is required'],
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient querying
appointmentSchema.index({ date: 1, dermatologist: 1 });
appointmentSchema.index({ date: 1, patient: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
