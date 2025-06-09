import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  id: string;
  name: string;
  description: string;
  module: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRolePermission extends Document {
  role: 'admin' | 'dermatologist' | 'receptionist';
  permissions: string[];
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const rolePermissionSchema = new Schema<IRolePermission>(
  {
    role: {
      type: String,
      enum: ['admin', 'dermatologist', 'receptionist'],
      required: true,
      unique: true,
    },
    permissions: [{
      type: String,
      required: true,
    }],
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
permissionSchema.index({ module: 1, isActive: 1 });
rolePermissionSchema.index({ role: 1, isActive: 1 });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
export const RolePermission = mongoose.model<IRolePermission>('RolePermission', rolePermissionSchema);

export default { Permission, RolePermission };
