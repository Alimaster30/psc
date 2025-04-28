import mongoose, { Document, Schema } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

export interface IMedicalHistory {
  condition: string;
  diagnosis: string;
  notes: string;
  diagnosedAt: Date;
}

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalHistory: string; // Encrypted medical history
  allergies: string; // Encrypted allergies
  bloodType?: string;
  visits: mongoose.Types.ObjectId[];
  prescriptions: mongoose.Types.ObjectId[];
  billings: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  getMedicalHistory(): IMedicalHistory[];
  setMedicalHistory(history: IMedicalHistory[]): void;
  getAllergies(): string[];
  setAllergies(allergies: string[]): void;
}

const patientSchema = new Schema<IPatient>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required'],
      },
      phoneNumber: {
        type: String,
        required: [true, 'Emergency contact phone number is required'],
      },
    },
    medicalHistory: {
      type: String, // Encrypted JSON string
      default: '',
    },
    allergies: {
      type: String, // Encrypted JSON string
      default: '',
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    visits: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Visit',
      },
    ],
    prescriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Prescription',
      },
    ],
    billings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Billing',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Methods for handling encrypted medical history
patientSchema.methods.getMedicalHistory = function (): IMedicalHistory[] {
  if (!this.medicalHistory) return [];
  try {
    const decrypted = decrypt(this.medicalHistory);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting medical history:', error);
    return [];
  }
};

patientSchema.methods.setMedicalHistory = function (history: IMedicalHistory[]): void {
  try {
    const jsonString = JSON.stringify(history);
    this.medicalHistory = encrypt(jsonString);
  } catch (error) {
    console.error('Error encrypting medical history:', error);
  }
};

// Methods for handling encrypted allergies
patientSchema.methods.getAllergies = function (): string[] {
  if (!this.allergies) return [];
  try {
    const decrypted = decrypt(this.allergies);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting allergies:', error);
    return [];
  }
};

patientSchema.methods.setAllergies = function (allergies: string[]): void {
  try {
    const jsonString = JSON.stringify(allergies);
    this.allergies = encrypt(jsonString);
  } catch (error) {
    console.error('Error encrypting allergies:', error);
  }
};

const Patient = mongoose.model<IPatient>('Patient', patientSchema);

export default Patient;
