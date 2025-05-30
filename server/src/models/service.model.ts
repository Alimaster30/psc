import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  process?: string;
  bundleOptions?: {
    sessions: number;
    price: number;
    savings: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const bundleOptionSchema = new Schema({
  sessions: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  savings: {
    type: Number,
    required: true,
  },
}, { _id: false });

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    process: {
      type: String,
      trim: true,
    },
    bundleOptions: [bundleOptionSchema],
  },
  {
    timestamps: true,
  }
);

// Create index for efficient querying
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ price: 1 });

const Service = mongoose.model<IService>('Service', serviceSchema);

export default Service;
