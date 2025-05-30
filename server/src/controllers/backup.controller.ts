import { Request, Response, NextFunction } from 'express';
import Backup from '../models/backup.model';
import { AppError } from '../middlewares/error.middleware';
import { UserRole } from '../models/user.model';
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

    // In a real implementation, we would trigger an actual database backup process here
    // For now, we'll simulate a backup process that completes after a short delay
    setTimeout(async () => {
      try {
        // Create a dummy backup file with some data
        const dummyBackupData = {
          timestamp: new Date(),
          createdBy: req.user.email,
          backupId,
          // In a real implementation, this would contain actual database data
          message: 'This is a simulated backup file for demonstration purposes.'
        };

        // Write the backup data to the file
        fs.writeFileSync(filePath, JSON.stringify(dummyBackupData, null, 2));

        // Get the file size
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);

        // Update the backup record with the file size and status
        await Backup.findByIdAndUpdate(backup._id, {
          size: `${fileSizeInKB} KB`,
          status: 'completed'
        });

        console.log(`Backup ${backupId} completed successfully`);
      } catch (error) {
        console.error(`Error completing backup ${backupId}:`, error);

        // Update the backup record with failed status
        await Backup.findByIdAndUpdate(backup._id, {
          status: 'failed'
        });
      }
    }, 5000); // Simulate a 5-second backup process

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
      res.setHeader('Content-Disposition', `attachment; filename=${backupId}.json`);

      // Create a read stream from the backup file and pipe it to the response
      const fileStream = fs.createReadStream(backup.filePath);
      fileStream.pipe(res);
    } else {
      // If the file doesn't exist, create a dummy backup file
      const dummyContent = `Pak Skin Care Backup
Backup ID: ${backupId}
Created: ${backup.timestamp.toISOString()}
Contents: This is a simulated backup file for demonstration purposes.

This backup would contain:
- Patient records
- Appointment history
- Prescription data
- Billing information
- System settings

In a production environment, this would be a properly formatted database backup.`;

      // Set the appropriate headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${backupId}.txt`);

      // Send the dummy content as the file
      res.send(Buffer.from(dummyContent));
    }
  } catch (error) {
    console.error('Download backup error:', error);
    next(error);
  }
};
