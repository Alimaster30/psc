import mongoose, { Document, Schema } from 'mongoose';

export interface IBackup extends Document {
  backupId: string;
  timestamp: Date;
  size: string;
  status: 'processing' | 'completed' | 'failed';
  filePath: string;
  createdBy: mongoose.Types.ObjectId;
}

const BackupSchema = new Schema<IBackup>(
  {
    backupId: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    size: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    filePath: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Backup = mongoose.model<IBackup>('Backup', BackupSchema);

export default Backup;
