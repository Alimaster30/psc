import mongoose, { Document, Schema } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

export interface IVisit extends Document {
  patient: mongoose.Types.ObjectId;
  dermatologist: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  date: Date;
  chiefComplaint: string;
  vitalSigns: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
  };
  notes: string; // Encrypted notes
  diagnosis: string;
  treatmentPlan: string; // Encrypted treatment plan
  prescription?: mongoose.Types.ObjectId;
  billing?: mongoose.Types.ObjectId;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  getNotes(): string;
  setNotes(notes: string): void;
  getTreatmentPlan(): string;
  setTreatmentPlan(plan: string): void;
}

const visitSchema = new Schema<IVisit>(
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
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    chiefComplaint: {
      type: String,
      required: [true, 'Chief complaint is required'],
    },
    vitalSigns: {
      temperature: {
        type: Number,
      },
      bloodPressure: {
        type: String,
      },
      heartRate: {
        type: Number,
      },
      respiratoryRate: {
        type: Number,
      },
      weight: {
        type: Number,
      },
      height: {
        type: Number,
      },
    },
    notes: {
      type: String, // Encrypted
      default: '',
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
    },
    treatmentPlan: {
      type: String, // Encrypted
      default: '',
    },
    prescription: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    billing: {
      type: Schema.Types.ObjectId,
      ref: 'Billing',
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Methods for handling encrypted notes
visitSchema.methods.getNotes = function (): string {
  if (!this.notes) return '';
  try {
    return decrypt(this.notes);
  } catch (error) {
    console.error('Error decrypting notes:', error);
    return '';
  }
};

visitSchema.methods.setNotes = function (notes: string): void {
  try {
    this.notes = encrypt(notes);
  } catch (error) {
    console.error('Error encrypting notes:', error);
  }
};

// Methods for handling encrypted treatment plan
visitSchema.methods.getTreatmentPlan = function (): string {
  if (!this.treatmentPlan) return '';
  try {
    return decrypt(this.treatmentPlan);
  } catch (error) {
    console.error('Error decrypting treatment plan:', error);
    return '';
  }
};

visitSchema.methods.setTreatmentPlan = function (plan: string): void {
  try {
    this.treatmentPlan = encrypt(plan);
  } catch (error) {
    console.error('Error encrypting treatment plan:', error);
  }
};

// Create index for efficient querying
visitSchema.index({ patient: 1, date: -1 });
visitSchema.index({ dermatologist: 1, date: -1 });

const Visit = mongoose.model<IVisit>('Visit', visitSchema);

export default Visit;
