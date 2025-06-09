import { Request, Response, NextFunction } from 'express';
import Backup from '../models/backup.model';
import { AppError } from '../middlewares/error.middleware';
import User, { UserRole } from '../models/user.model';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import Billing from '../models/billing.model';
import Service from '../models/service.model';
import Visit from '../models/visit.model';
import Settings from '../models/settings.model';
import { Permission, RolePermission } from '../models/permission.model';
import AuditLog from '../models/auditLog.model';
import AuditLogService from '../services/auditLog.service';
import { AuditAction } from '../models/auditLog.model';
import path from 'path';
import fs from 'fs';

/**
 * Create a new backup
 * @route GET /api/backups/create
 * @access Private (Admin only)
 */
export const createBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to create backups', 403));
    }

    const backupId = `backup-${Date.now()}`;
    const timestamp = new Date();

    // Create a backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create a file path for the backup
    const filePath = path.join(backupDir, `${backupId}.json`);

    // Create a new backup record in the database
    const backup = await Backup.create({
      backupId,
      timestamp,
      size: '0 KB', // Will be updated after backup is complete
      status: 'processing',
      filePath,
      createdBy: req.user.id
    });

    // Log the action
    console.log(`Admin ${req.user?.email} triggered system backup ${backupId}`);

    // Trigger real database backup process
    setTimeout(async () => {
      try {
        // Use imported models for backup

        // Create comprehensive backup data
        const backupData = {
          metadata: {
            timestamp: new Date(),
            createdBy: req.user.email,
            backupId,
            version: '1.0',
            description: 'Complete Prime Skin Clinic database backup'
          },
          data: {
            users: await User.find({}).select('-password'),
            patients: await Patient.find({}),
            appointments: await Appointment.find({}),
            prescriptions: await Prescription.find({}),
            billings: await Billing.find({}),
            services: await Service.find({}),
            visits: await Visit.find({}),
            settings: await Settings.find({}),
            permissions: await Permission.find({}),
            rolePermissions: await RolePermission.find({}),
            auditLogs: await AuditLog.find({}).limit(1000).sort({ timestamp: -1 }) // Last 1000 audit logs
          },
          statistics: {
            totalUsers: await User.countDocuments(),
            totalPatients: await Patient.countDocuments(),
            totalAppointments: await Appointment.countDocuments(),
            totalPrescriptions: await Prescription.countDocuments(),
            totalBillings: await Billing.countDocuments(),
            totalServices: await Service.countDocuments(),
            totalVisits: await Visit.countDocuments(),
            totalAuditLogs: await AuditLog.countDocuments()
          }
        };

        // Write the backup data to the file
        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        // Get the file size
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

        // Update the backup record with the file size and status
        await Backup.findByIdAndUpdate(backup._id, {
          size: `${fileSizeInMB} MB`,
          status: 'completed'
        });

        console.log(`Real database backup ${backupId} completed successfully`);
        console.log(`Backup contains ${backupData.statistics.totalPatients} patients, ${backupData.statistics.totalAppointments} appointments, and more`);
      } catch (error) {
        console.error(`Error completing backup ${backupId}:`, error);

        // Update the backup record with failed status
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'failed'
        });
      }
    }, 2000); // Real backup process with 2-second delay

    res.status(200).json({
      success: true,
      message: 'Backup process initiated successfully',
      data: backup
    });
  } catch (error) {
    console.error('Create backup error:', error);
    next(error);
  }
};

/**
 * Get all backups
 * @route GET /api/backups
 * @access Private (Admin only)
 */
export const getBackups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to view backups', 403));
    }

    // Fetch all backups from the database, sorted by timestamp (newest first)
    const backups = await Backup.find()
      .sort({ timestamp: -1 })
      .populate('createdBy', 'firstName lastName email');

    // Add download URL to each backup
    const backupsWithDownloadUrl = backups.map(backup => {
      const backupObj = backup.toObject();
      return {
        ...backupObj,
        downloadUrl: `/api/backups/download/${backup.backupId}`
      };
    });

    res.status(200).json({
      success: true,
      count: backups.length,
      data: backupsWithDownloadUrl,
    });
  } catch (error) {
    console.error('Get backups error:', error);
    next(error);
  }
};

/**
 * Download a backup
 * @route GET /api/backups/download/:backupId
 * @access Private (Admin only)
 */
export const downloadBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { backupId } = req.params;

    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to download backups', 403));
    }

    // Find the backup in the database
    const backup = await Backup.findOne({ backupId });
    if (!backup) {
      return next(new AppError('Backup not found', 404));
    }

    // Log the download request
    console.log(`Admin ${req.user?.email} requested download of backup ${backupId}`);

    // Check if the backup file exists
    if (backup.filePath && fs.existsSync(backup.filePath)) {
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=prime-skin-clinic-backup-${backupId}.json`);

      // Create a read stream from the backup file and pipe it to the response
      const fileStream = fs.createReadStream(backup.filePath);
      fileStream.pipe(res);

      // Log the successful download
      await AuditLogService.logSystemActivity(
        AuditAction.BACKUP_DOWNLOADED,
        req.user,
        'Backup Management',
        req,
        `Downloaded backup: ${backupId}`
      );
    } else {
      return next(new AppError('Backup file not found on disk', 404));
    }
  } catch (error) {
    console.error('Download backup error:', error);
    next(error);
  }
};

/**
 * Restore from backup
 * @route POST /api/backups/restore/:backupId
 * @access Private (Admin only)
 */
export const restoreBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { backupId } = req.params;

    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to restore backups', 403));
    }

    // Find the backup in the database
    const backup = await Backup.findOne({ backupId });
    if (!backup) {
      return next(new AppError('Backup not found', 404));
    }

    // Check if the backup file exists
    if (!backup.filePath || !fs.existsSync(backup.filePath)) {
      return next(new AppError('Backup file not found on disk', 404));
    }

    // Read and parse the backup file
    const backupContent = fs.readFileSync(backup.filePath, 'utf8');
    const backupData = JSON.parse(backupContent);

    // Validate backup data structure
    if (!backupData.data || !backupData.metadata) {
      return next(new AppError('Invalid backup file format', 400));
    }

    // Log the restore attempt
    await AuditLogService.logSystemActivity(
      AuditAction.BACKUP_RESTORED,
      req.user,
      'Backup Management',
      req,
      `Started restore from backup: ${backupId}`
    );

    // Use imported models for restore

    // WARNING: This is a destructive operation - clear existing data
    console.log('WARNING: Starting destructive restore operation');

    // Clear existing data (except users and audit logs for safety)
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Billing.deleteMany({});
    await Service.deleteMany({});
    await Visit.deleteMany({});
    await Settings.deleteMany({});
    await Permission.deleteMany({});
    await RolePermission.deleteMany({});

    // Restore data from backup
    let restoredCounts = {
      patients: 0,
      appointments: 0,
      prescriptions: 0,
      billings: 0,
      services: 0,
      visits: 0,
      settings: 0,
      permissions: 0,
      rolePermissions: 0
    };

    // Restore each collection
    if (backupData.data.patients && backupData.data.patients.length > 0) {
      await Patient.insertMany(backupData.data.patients);
      restoredCounts.patients = backupData.data.patients.length;
    }

    if (backupData.data.appointments && backupData.data.appointments.length > 0) {
      await Appointment.insertMany(backupData.data.appointments);
      restoredCounts.appointments = backupData.data.appointments.length;
    }

    if (backupData.data.prescriptions && backupData.data.prescriptions.length > 0) {
      await Prescription.insertMany(backupData.data.prescriptions);
      restoredCounts.prescriptions = backupData.data.prescriptions.length;
    }

    if (backupData.data.billings && backupData.data.billings.length > 0) {
      await Billing.insertMany(backupData.data.billings);
      restoredCounts.billings = backupData.data.billings.length;
    }

    if (backupData.data.services && backupData.data.services.length > 0) {
      await Service.insertMany(backupData.data.services);
      restoredCounts.services = backupData.data.services.length;
    }

    if (backupData.data.visits && backupData.data.visits.length > 0) {
      await Visit.insertMany(backupData.data.visits);
      restoredCounts.visits = backupData.data.visits.length;
    }

    if (backupData.data.settings && backupData.data.settings.length > 0) {
      await Settings.insertMany(backupData.data.settings);
      restoredCounts.settings = backupData.data.settings.length;
    }

    if (backupData.data.permissions && backupData.data.permissions.length > 0) {
      await Permission.insertMany(backupData.data.permissions);
      restoredCounts.permissions = backupData.data.permissions.length;
    }

    if (backupData.data.rolePermissions && backupData.data.rolePermissions.length > 0) {
      await RolePermission.insertMany(backupData.data.rolePermissions);
      restoredCounts.rolePermissions = backupData.data.rolePermissions.length;
    }

    // Log successful restore
    await AuditLogService.logSystemActivity(
      AuditAction.BACKUP_RESTORED,
      req.user,
      'Backup Management',
      req,
      `Successfully restored from backup: ${backupId}. Restored: ${JSON.stringify(restoredCounts)}`
    );

    console.log(`Backup ${backupId} restored successfully:`, restoredCounts);

    res.status(200).json({
      success: true,
      message: 'Backup restored successfully',
      data: {
        backupId,
        restoredCounts,
        restoredFrom: backupData.metadata.timestamp
      }
    });
  } catch (error) {
    console.error('Restore backup error:', error);

    // Log failed restore attempt
    try {
      await AuditLogService.logSystemActivity(
        AuditAction.BACKUP_RESTORED,
        req.user,
        'Backup Management',
        req,
        `Failed to restore from backup: ${req.params.backupId}. Error: ${(error as Error).message}`
      );
    } catch (logError) {
      console.error('Error logging failed restore:', logError);
    }

    next(error);
  }
};
