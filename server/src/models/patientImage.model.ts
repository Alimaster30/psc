import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientImage extends Document {
  patient: mongoose.Types.ObjectId;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  tags: string[];
  metadata: {
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  };
  isBefore: boolean;
  relatedImages?: mongoose.Types.ObjectId[];
}

const PatientImageSchema: Schema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'acne',
        'eczema',
        'psoriasis',
        'rosacea',
        'skin_cancer',
        'vitiligo',
        'rash',
        'allergy',
        'other',
      ],
    },
    description: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    tags: [
      {
        type: String,
      },
    ],
    metadata: {
      originalFilename: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
    },
    isBefore: {
      type: Boolean,
      default: true,
    },
    relatedImages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PatientImage',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPatientImage>('PatientImage', PatientImageSchema);
