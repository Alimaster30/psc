import { Request } from 'express';
import mongoose from 'mongoose';
import AuditLog, { AuditAction, AuditSeverity, IAuditLog } from '../models/auditLog.model';

interface AuditLogData {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: string;
  severity?: AuditSeverity;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

class AuditLogService {
  /**
   * Create an audit log entry
   */
  static async log(data: AuditLogData, req?: Request): Promise<void> {
    try {
      const auditData: Partial<IAuditLog> = {
        userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
        userEmail: data.userEmail,
        userName: data.userName,
        userRole: data.userRole,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        severity: data.severity || AuditSeverity.MEDIUM,
        metadata: data.metadata,
        success: data.success !== undefined ? data.success : true,
        errorMessage: data.errorMessage,
        timestamp: new Date(),
      };

      // Extract IP address and user agent from request if available
      if (req) {
        auditData.ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
        auditData.userAgent = req.get('User-Agent') || 'Unknown';
      }

      await AuditLog.create(auditData);
    } catch (error) {
      // Don't throw errors for audit logging failures to avoid breaking main functionality
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth(action: AuditAction, userEmail: string, success: boolean, req?: Request, errorMessage?: string): Promise<void> {
    const severity = success ? AuditSeverity.LOW : AuditSeverity.HIGH;
    const details = success 
      ? `User ${userEmail} ${action.toLowerCase()} successfully`
      : `Failed ${action.toLowerCase()} attempt for ${userEmail}`;

    await this.log({
      userEmail,
      action,
      resource: 'Authentication',
      details,
      severity,
      success,
      errorMessage,
    }, req);
  }

  /**
   * Log user management events
   */
  static async logUserManagement(action: AuditAction, performedBy: any, targetUser: any, req?: Request): Promise<void> {
    await this.log({
      userId: performedBy._id?.toString(),
      userEmail: performedBy.email,
      userName: `${performedBy.firstName} ${performedBy.lastName}`,
      userRole: performedBy.role,
      action,
      resource: 'User Management',
      resourceId: targetUser._id?.toString(),
      details: `${action.replace('_', ' ').toLowerCase()} user: ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})`,
      severity: AuditSeverity.HIGH,
      metadata: {
        targetUserId: targetUser._id,
        targetUserEmail: targetUser.email,
        targetUserRole: targetUser.role,
      },
    }, req);
  }

  /**
   * Log patient data access and modifications
   */
  static async logPatientActivity(action: AuditAction, user: any, patient: any, req?: Request, additionalDetails?: string): Promise<void> {
    const severity = action.includes('VIEWED') ? AuditSeverity.LOW : AuditSeverity.MEDIUM;
    const details = additionalDetails || `${action.replace('_', ' ').toLowerCase()} for patient: ${patient.firstName} ${patient.lastName}`;

    await this.log({
      userId: user._id?.toString(),
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action,
      resource: 'Patient Data',
      resourceId: patient._id?.toString(),
      details,
      severity,
      metadata: {
        patientId: patient._id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientEmail: patient.email,
      },
    }, req);
  }

  /**
   * Log appointment activities
   */
  static async logAppointmentActivity(action: AuditAction, user: any, appointment: any, req?: Request): Promise<void> {
    await this.log({
      userId: user._id?.toString(),
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action,
      resource: 'Appointment',
      resourceId: appointment._id?.toString(),
      details: `${action.replace('_', ' ').toLowerCase()} appointment for ${appointment.date}`,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        appointmentId: appointment._id,
        appointmentDate: appointment.date,
        patientId: appointment.patient,
        dermatologistId: appointment.dermatologist,
      },
    }, req);
  }

  /**
   * Log prescription activities
   */
  static async logPrescriptionActivity(action: AuditAction, user: any, prescription: any, req?: Request): Promise<void> {
    await this.log({
      userId: user._id?.toString(),
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action,
      resource: 'Prescription',
      resourceId: prescription._id?.toString(),
      details: `${action.replace('_', ' ').toLowerCase()} prescription for patient`,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        prescriptionId: prescription._id,
        patientId: prescription.patient,
        medicationCount: prescription.medications?.length || 0,
      },
    }, req);
  }

  /**
   * Log billing activities
   */
  static async logBillingActivity(action: AuditAction, user: any, billing: any, req?: Request): Promise<void> {
    await this.log({
      userId: user._id?.toString(),
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action,
      resource: 'Billing',
      resourceId: billing._id?.toString(),
      details: `${action.replace('_', ' ').toLowerCase()} billing record ${billing.invoiceNumber}`,
      severity: AuditSeverity.MEDIUM,
      metadata: {
        billingId: billing._id,
        invoiceNumber: billing.invoiceNumber,
        amount: billing.total,
        patientId: billing.patient,
      },
    }, req);
  }

  /**
   * Log system administration activities
   */
  static async logSystemActivity(action: AuditAction, user: any, resource: string, req?: Request, details?: string): Promise<void> {
    await this.log({
      userId: user._id?.toString(),
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      action,
      resource,
      details: details || `${action.replace('_', ' ').toLowerCase()}`,
      severity: AuditSeverity.HIGH,
    }, req);
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(action: AuditAction, user: any, resource: string, req?: Request, details?: string): Promise<void> {
    await this.log({
      userId: user?._id?.toString(),
      userEmail: user?.email,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      userRole: user?.role,
      action,
      resource,
      details: details || `Security event: ${action.replace('_', ' ').toLowerCase()}`,
      severity: AuditSeverity.CRITICAL,
      success: false,
    }, req);
  }
}

export default AuditLogService;
