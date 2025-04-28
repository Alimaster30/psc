import mongoose, { Document, Schema } from 'mongoose';

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IPrescription extends Document {
  patient: mongoose.Types.ObjectId;
  dermatologist: mongoose.Types.ObjectId;
  date: Date;
  diagnosis: string;
  medications: IMedication[];
  notes?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const medicationSchema = new Schema<IMedication>({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
  },
  instructions: {
    type: String,
    required: [true, 'Instructions are required'],
  },
});

const prescriptionSchema = new Schema<IPrescription>(
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
    date: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
    },
    medications: [medicationSchema],
    notes: {
      type: String,
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient querying
prescriptionSchema.index({ patient: 1, date: -1 });
prescriptionSchema.index({ dermatologist: 1, date: -1 });

const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);

export default Prescription;
