import { Request, Response, NextFunction } from 'express';
import { Permission, RolePermission } from '../models/permission.model';
import { AppError } from '../middlewares/error.middleware';
import { UserRole } from '../models/user.model';
import AuditLogService from '../services/auditLog.service';
import { AuditAction } from '../models/auditLog.model';

/**
 * Get all permissions
 * @route GET /api/permissions
 * @access Private (Admin only)
 */
export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access permissions', 403));
    }

    const permissions = await Permission.find({ isActive: true }).sort({ module: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all role permissions
 * @route GET /api/permissions/roles
 * @access Private (Admin only)
 */
export const getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access role permissions', 403));
    }

    const rolePermissions = await RolePermission.find({ isActive: true }).sort({ role: 1 });

    res.status(200).json({
      success: true,
      data: rolePermissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role permissions
 * @route PUT /api/permissions/roles
 * @access Private (Admin only)
 */
export const updateRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to update role permissions', 403));
    }

    const { rolePermissions } = req.body;

    if (!rolePermissions || !Array.isArray(rolePermissions)) {
      return next(new AppError('Invalid role permissions data', 400));
    }

    // Update each role permission
    const updatedRolePermissions = [];
    
    for (const rolePermData of rolePermissions) {
      const { role, permissions, description } = rolePermData;

      // Validate role
      if (!['admin', 'dermatologist', 'receptionist'].includes(role)) {
        return next(new AppError(`Invalid role: ${role}`, 400));
      }

      // Validate permissions exist
      const validPermissions = await Permission.find({ 
        id: { $in: permissions },
        isActive: true 
      });

      const validPermissionIds = validPermissions.map(p => p.id);
      const invalidPermissions = permissions.filter((p: string) => !validPermissionIds.includes(p));

      if (invalidPermissions.length > 0) {
        return next(new AppError(`Invalid permissions: ${invalidPermissions.join(', ')}`, 400));
      }

      // Update or create role permission
      const updatedRolePermission = await RolePermission.findOneAndUpdate(
        { role },
        {
          role,
          permissions,
          description,
          isActive: true,
        },
        { 
          new: true, 
          upsert: true,
          runValidators: true 
        }
      );

      updatedRolePermissions.push(updatedRolePermission);

      // Log the permission change
      await AuditLogService.logSystemActivity(
        AuditAction.SETTINGS_UPDATED,
        req.user,
        'Role Permissions',
        req,
        `Updated permissions for role: ${role}`
      );
    }

    res.status(200).json({
      success: true,
      data: updatedRolePermissions,
      message: 'Role permissions updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permissions for a specific role
 * @route GET /api/permissions/roles/:role
 * @access Private (Admin only)
 */
export const getRolePermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access role permissions', 403));
    }

    const { role } = req.params;

    // Validate role
    if (!['admin', 'dermatologist', 'receptionist'].includes(role)) {
      return next(new AppError(`Invalid role: ${role}`, 400));
    }

    const rolePermission = await RolePermission.findOne({ role, isActive: true });

    if (!rolePermission) {
      return next(new AppError(`Role permissions not found for: ${role}`, 404));
    }

    res.status(200).json({
      success: true,
      data: rolePermission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has specific permission
 * @route GET /api/permissions/check/:permission
 * @access Private
 */
export const checkPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { permission } = req.params;
    const userRole = req.user.role;

    // Get role permissions
    const rolePermission = await RolePermission.findOne({ 
      role: userRole, 
      isActive: true 
    });

    const hasPermission = rolePermission?.permissions.includes(permission) || false;

    res.status(200).json({
      success: true,
      data: {
        hasPermission,
        permission,
        role: userRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initialize default permissions and role permissions
 * @route POST /api/permissions/initialize
 * @access Private (Admin only)
 */
export const initializePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to initialize permissions', 403));
    }

    // Check if permissions already exist
    const existingPermissions = await Permission.countDocuments();
    if (existingPermissions > 0) {
      return next(new AppError('Permissions already initialized', 400));
    }

    // Default permissions
    const defaultPermissions = [
      // Patient Management
      { id: 'patient_view', name: 'View Patients', description: 'View patient information', module: 'Patient Management' },
      { id: 'patient_create', name: 'Create Patients', description: 'Create new patient records', module: 'Patient Management' },
      { id: 'patient_edit', name: 'Edit Patients', description: 'Edit patient information', module: 'Patient Management' },
      { id: 'patient_delete', name: 'Delete Patients', description: 'Delete patient records', module: 'Patient Management' },
      { id: 'patient_medical_view', name: 'View Medical History', description: 'View patient medical history', module: 'Patient Management' },
      { id: 'patient_medical_edit', name: 'Edit Medical History', description: 'Edit patient medical history', module: 'Patient Management' },
      
      // Appointment Management
      { id: 'appointment_view', name: 'View Appointments', description: 'View appointment schedules', module: 'Appointment Management' },
      { id: 'appointment_create', name: 'Create Appointments', description: 'Schedule new appointments', module: 'Appointment Management' },
      { id: 'appointment_edit', name: 'Edit Appointments', description: 'Modify appointment details', module: 'Appointment Management' },
      { id: 'appointment_delete', name: 'Delete Appointments', description: 'Cancel appointments', module: 'Appointment Management' },
      { id: 'appointment_complete', name: 'Complete Appointments', description: 'Mark appointments as completed', module: 'Appointment Management' },
      
      // Prescription Management
      { id: 'prescription_view', name: 'View Prescriptions', description: 'View prescription records', module: 'Prescription Management' },
      { id: 'prescription_create', name: 'Create Prescriptions', description: 'Create new prescriptions', module: 'Prescription Management' },
      { id: 'prescription_edit', name: 'Edit Prescriptions', description: 'Modify prescription details', module: 'Prescription Management' },
      { id: 'prescription_delete', name: 'Delete Prescriptions', description: 'Delete prescription records', module: 'Prescription Management' },
      
      // Billing Management
      { id: 'billing_view', name: 'View Billing', description: 'View billing information', module: 'Billing Management' },
      { id: 'billing_create', name: 'Create Bills', description: 'Generate new bills', module: 'Billing Management' },
      { id: 'billing_edit', name: 'Edit Bills', description: 'Modify billing details', module: 'Billing Management' },
      { id: 'billing_delete', name: 'Delete Bills', description: 'Delete billing records', module: 'Billing Management' },
      { id: 'billing_payment', name: 'Process Payments', description: 'Process bill payments', module: 'Billing Management' },
      
      // User Management
      { id: 'user_view', name: 'View Users', description: 'View user accounts', module: 'User Management' },
      { id: 'user_create', name: 'Create Users', description: 'Create new user accounts', module: 'User Management' },
      { id: 'user_edit', name: 'Edit Users', description: 'Modify user account details', module: 'User Management' },
      { id: 'user_delete', name: 'Delete Users', description: 'Delete user accounts', module: 'User Management' },
      { id: 'user_permissions', name: 'Manage Permissions', description: 'Manage user permissions', module: 'User Management' },
      
      // Analytics
      { id: 'analytics_view', name: 'View Analytics', description: 'View system analytics and reports', module: 'Analytics' },
      { id: 'analytics_export', name: 'Export Reports', description: 'Export analytics reports', module: 'Analytics' },
      
      // Settings
      { id: 'settings_view', name: 'View Settings', description: 'View system settings', module: 'Settings' },
      { id: 'settings_edit', name: 'Edit Settings', description: 'Edit system settings', module: 'Settings' },
      
      // Backup
      { id: 'backup_create', name: 'Create Backups', description: 'Create system backups', module: 'Backup' },
      { id: 'backup_restore', name: 'Restore Backups', description: 'Restore system from backups', module: 'Backup' },
      { id: 'backup_download', name: 'Download Backups', description: 'Download backup files', module: 'Backup' },
      
      // Audit Logs
      { id: 'audit_view', name: 'View Audit Logs', description: 'View system audit logs', module: 'Audit Logs' },
      { id: 'audit_export', name: 'Export Audit Logs', description: 'Export audit log reports', module: 'Audit Logs' },
    ];

    // Create permissions
    await Permission.insertMany(defaultPermissions);

    // Default role permissions
    const defaultRolePermissions = [
      {
        role: 'admin',
        permissions: defaultPermissions.map(p => p.id), // Admin has all permissions
        description: 'Full system access with all permissions'
      },
      {
        role: 'dermatologist',
        permissions: [
          'patient_view', 'patient_medical_view', 'patient_medical_edit',
          'appointment_view', 'appointment_complete',
          'prescription_view', 'prescription_create', 'prescription_edit',
          'analytics_view'
        ],
        description: 'Medical staff with access to patient records and prescriptions'
      },
      {
        role: 'receptionist',
        permissions: [
          'patient_view', 'patient_create', 'patient_edit',
          'appointment_view', 'appointment_create', 'appointment_edit', 'appointment_delete',
          'billing_view', 'billing_create', 'billing_payment',
          'prescription_view'
        ],
        description: 'Front desk staff with access to appointments and billing'
      }
    ];

    // Create role permissions
    await RolePermission.insertMany(defaultRolePermissions);

    // Log the initialization
    await AuditLogService.logSystemActivity(
      AuditAction.SETTINGS_UPDATED,
      req.user,
      'Permission System',
      req,
      'Initialized default permissions and role permissions'
    );

    res.status(201).json({
      success: true,
      message: 'Permissions initialized successfully',
      data: {
        permissionsCreated: defaultPermissions.length,
        rolePermissionsCreated: defaultRolePermissions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
