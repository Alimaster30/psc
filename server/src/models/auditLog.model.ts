import mongoose, { Document, Schema } from 'mongoose';

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  
  // Patient Management
  PATIENT_CREATED = 'PATIENT_CREATED',
  PATIENT_UPDATED = 'PATIENT_UPDATED',
  PATIENT_DELETED = 'PATIENT_DELETED',
  PATIENT_VIEWED = 'PATIENT_VIEWED',
  PATIENT_MEDICAL_HISTORY_UPDATED = 'PATIENT_MEDICAL_HISTORY_UPDATED',
  
  // Appointments
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED = 'APPOINTMENT_UPDATED',
  APPOINTMENT_DELETED = 'APPOINTMENT_DELETED',
  APPOINTMENT_STATUS_CHANGED = 'APPOINTMENT_STATUS_CHANGED',
  
  // Prescriptions
  PRESCRIPTION_CREATED = 'PRESCRIPTION_CREATED',
  PRESCRIPTION_UPDATED = 'PRESCRIPTION_UPDATED',
  PRESCRIPTION_DELETED = 'PRESCRIPTION_DELETED',
  PRESCRIPTION_VIEWED = 'PRESCRIPTION_VIEWED',
  
  // Billing
  BILLING_CREATED = 'BILLING_CREATED',
  BILLING_UPDATED = 'BILLING_UPDATED',
  BILLING_DELETED = 'BILLING_DELETED',
  BILLING_VIEWED = 'BILLING_VIEWED',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  
  // System Administration
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_DOWNLOADED = 'BACKUP_DOWNLOADED',
  
  // Data Access
  ANALYTICS_VIEWED = 'ANALYTICS_VIEWED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  
  // Security
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: string;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Not required for failed login attempts
    },
    userEmail: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false,
    },
    userRole: {
      type: String,
      required: false,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
      required: false,
    },
    details: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(AuditSeverity),
      required: true,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
    },
    errorMessage: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
