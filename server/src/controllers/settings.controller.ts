import { Request, Response, NextFunction } from 'express';
import Settings, { ISettings } from '../models/settings.model';
import { AppError } from '../middlewares/error.middleware';
import { UserRole } from '../models/user.model';
import AuditLogService from '../services/auditLog.service';
import { AuditAction } from '../models/auditLog.model';

/**
 * Get system settings
 * @route GET /api/settings
 * @access Private (Admin only)
 */
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access system settings', 403));
    }

    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings if not found
      const defaultSettings = {
        clinicName: 'Prime Skin Clinic',
        address: '123 Medical Plaza, Islamabad, Pakistan',
        phoneNumber: '+92 51 1234567',
        email: 'info@primeskinclinic.com',
        website: 'www.primeskinclinic.com',
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '09:00', end: '14:00' },
          sunday: { start: 'Closed', end: 'Closed' }
        },
        consultationFees: {
          initial: 3000,
          followUp: 2000
        },
        currency: 'PKR',
        taxRate: 0,
        notifications: {
          appointmentReminders: true,
          reminderHours: 24,
          smsEnabled: false,
          emailEnabled: true,
          prescriptionReady: true,
          paymentReceived: true
        },
        backup: {
          autoBackup: true,
          backupFrequency: 'daily' as const,
          backupTime: '02:00',
          retentionDays: 30
        },
        appointmentDuration: 30,
        appointmentBuffer: 15,
        logo: ''
      };

      settings = await Settings.create(defaultSettings);
    }

    // Log settings access
    await AuditLogService.logSystemActivity(
      AuditAction.SETTINGS_UPDATED,
      req.user,
      'System Settings',
      req,
      'Accessed system settings'
    );

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings
 * @route PUT /api/settings
 * @access Private (Admin only)
 */
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to update system settings', 403));
    }

    const {
      clinicName,
      address,
      phoneNumber,
      email,
      website,
      workingHours,
      consultationFees,
      currency,
      taxRate,
      notifications,
      backup,
      appointmentDuration,
      appointmentBuffer,
      logo
    } = req.body;

    // Validate required fields
    if (!clinicName || !address || !phoneNumber || !email) {
      return next(new AppError('Clinic name, address, phone number, and email are required', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Invalid email format', 400));
    }

    // Validate consultation fees
    if (consultationFees) {
      if (consultationFees.initial < 0 || consultationFees.followUp < 0) {
        return next(new AppError('Consultation fees cannot be negative', 400));
      }
    }

    // Validate tax rate
    if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
      return next(new AppError('Tax rate must be between 0 and 100', 400));
    }

    // Validate appointment duration and buffer
    if (appointmentDuration !== undefined && appointmentDuration < 5) {
      return next(new AppError('Appointment duration must be at least 5 minutes', 400));
    }

    if (appointmentBuffer !== undefined && appointmentBuffer < 0) {
      return next(new AppError('Appointment buffer cannot be negative', 400));
    }

    // Validate working hours format
    if (workingHours) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        if (workingHours[day]) {
          const { start, end } = workingHours[day];
          if (start !== 'Closed' && end !== 'Closed') {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(start) || !timeRegex.test(end)) {
              return next(new AppError(`Invalid time format for ${day}. Use HH:MM format or 'Closed'`, 400));
            }
          }
        }
      }
    }

    // Update settings
    const updateData = {
      ...(clinicName && { clinicName }),
      ...(address && { address }),
      ...(phoneNumber && { phoneNumber }),
      ...(email && { email }),
      ...(website && { website }),
      ...(workingHours && { workingHours }),
      ...(consultationFees && { consultationFees }),
      ...(currency && { currency }),
      ...(taxRate !== undefined && { taxRate }),
      ...(notifications && { notifications }),
      ...(backup && { backup }),
      ...(appointmentDuration && { appointmentDuration }),
      ...(appointmentBuffer !== undefined && { appointmentBuffer }),
      ...(logo !== undefined && { logo })
    };

    const settings = await Settings.findOneAndUpdate(
      {},
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // Log settings update
    await AuditLogService.logSystemActivity(
      AuditAction.SETTINGS_UPDATED,
      req.user,
      'System Settings',
      req,
      'Updated system settings'
    );

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset settings to default
 * @route POST /api/settings/reset
 * @access Private (Admin only)
 */
export const resetSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to reset system settings', 403));
    }

    // Default settings
    const defaultSettings = {
      clinicName: 'Prime Skin Clinic',
      address: '123 Medical Plaza, Islamabad, Pakistan',
      phoneNumber: '+92 51 1234567',
      email: 'info@primeskinclinic.com',
      website: 'www.primeskinclinic.com',
      workingHours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '14:00' },
        sunday: { start: 'Closed', end: 'Closed' }
      },
      consultationFees: {
        initial: 3000,
        followUp: 2000
      },
      currency: 'PKR',
      taxRate: 0,
      notifications: {
        appointmentReminders: true,
        reminderHours: 24,
        smsEnabled: false,
        emailEnabled: true,
        prescriptionReady: true,
        paymentReceived: true
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'daily' as const,
        backupTime: '02:00',
        retentionDays: 30
      },
      appointmentDuration: 30,
      appointmentBuffer: 15,
      logo: ''
    };

    // Reset settings
    const settings = await Settings.findOneAndUpdate(
      {},
      defaultSettings,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // Log settings reset
    await AuditLogService.logSystemActivity(
      AuditAction.SETTINGS_UPDATED,
      req.user,
      'System Settings',
      req,
      'Reset system settings to default values'
    );

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings reset to default values successfully'
    });
  } catch (error) {
    next(error);
  }
};