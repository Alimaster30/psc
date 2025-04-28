import { Request, Response, NextFunction } from 'express';
import Appointment, { AppointmentStatus } from '../models/appointment.model';
import User, { UserRole } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

/**
 * Get all appointments
 * @route GET /api/appointments
 * @access Private
 */
export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, date, startDate, endDate, dermatologist, patient } = req.query;

    // For development/demo purposes, use mock data
    // In production, this would use the database query with filters

    // Mock data for demonstration
    const mockAppointments = [
      {
        _id: '1',
        patient: {
          _id: '1',
          firstName: 'Ahmed',
          lastName: 'Khan',
          email: 'ahmed@example.com',
          phoneNumber: '+92 300 1234567'
        },
        dermatologist: {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Ali'
        },
        date: new Date().toISOString().split('T')[0], // Today
        startTime: '09:00',
        endTime: '09:30',
        status: AppointmentStatus.CONFIRMED,
        reason: 'Acne consultation',
        notes: 'Patient has been experiencing severe acne for 3 months',
        createdBy: {
          _id: '4',
          firstName: 'Front',
          lastName: 'Desk'
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        patient: {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Malik',
          email: 'fatima@example.com',
          phoneNumber: '+92 300 7654321'
        },
        dermatologist: {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Ali'
        },
        date: new Date().toISOString().split('T')[0], // Today
        startTime: '10:00',
        endTime: '10:30',
        status: AppointmentStatus.SCHEDULED,
        reason: 'Eczema follow-up',
        notes: 'Check progress with prescribed treatment',
        createdBy: {
          _id: '4',
          firstName: 'Front',
          lastName: 'Desk'
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        patient: {
          _id: '3',
          firstName: 'Muhammad',
          lastName: 'Raza',
          email: 'muhammad@example.com',
          phoneNumber: '+92 300 9876543'
        },
        dermatologist: {
          _id: '3',
          firstName: 'Imran',
          lastName: 'Ahmed'
        },
        date: new Date().toISOString().split('T')[0], // Today
        startTime: '11:00',
        endTime: '11:30',
        status: AppointmentStatus.COMPLETED,
        reason: 'Psoriasis treatment',
        notes: 'Patient responding well to treatment',
        createdBy: {
          _id: '4',
          firstName: 'Front',
          lastName: 'Desk'
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: '4',
        patient: {
          _id: '4',
          firstName: 'Ayesha',
          lastName: 'Siddiqui',
          email: 'ayesha@example.com',
          phoneNumber: '+92 300 1122334'
        },
        dermatologist: {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Ali'
        },
        date: (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow.toISOString().split('T')[0];
        })(), // Tomorrow
        startTime: '09:00',
        endTime: '09:30',
        status: AppointmentStatus.SCHEDULED,
        reason: 'Skin allergy',
        notes: 'First consultation for skin rash',
        createdBy: {
          _id: '4',
          firstName: 'Front',
          lastName: 'Desk'
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: '5',
        patient: {
          _id: '5',
          firstName: 'Zainab',
          lastName: 'Qureshi',
          email: 'zainab@example.com',
          phoneNumber: '+92 300 5566778'
        },
        dermatologist: {
          _id: '3',
          firstName: 'Imran',
          lastName: 'Ahmed'
        },
        date: (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow.toISOString().split('T')[0];
        })(), // Tomorrow
        startTime: '10:00',
        endTime: '10:30',
        status: AppointmentStatus.CONFIRMED,
        reason: 'Hair loss consultation',
        notes: 'Patient experiencing hair thinning',
        createdBy: {
          _id: '4',
          firstName: 'Front',
          lastName: 'Desk'
        },
        createdAt: new Date().toISOString()
      }
    ];

    // Apply filters to mock data
    let filteredAppointments = [...mockAppointments];

    // Filter by status
    if (status) {
      filteredAppointments = filteredAppointments.filter(
        appointment => appointment.status === status
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      filteredAppointments = filteredAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= start && appointmentDate <= end;
      });
    } else if (date) {
      // Filter by single date
      filteredAppointments = filteredAppointments.filter(
        appointment => appointment.date === date
      );
    }

    // Filter by dermatologist
    if (dermatologist) {
      filteredAppointments = filteredAppointments.filter(
        appointment => appointment.dermatologist._id === dermatologist
      );
    }

    // Filter by patient
    if (patient) {
      filteredAppointments = filteredAppointments.filter(
        appointment => appointment.patient._id === patient
      );
    }

    // If user is a dermatologist, only show their appointments
    if (req.user && req.user.role === UserRole.DERMATOLOGIST) {
      filteredAppointments = filteredAppointments.filter(
        appointment => appointment.dermatologist._id === req.user.id
      );
    }

    // Sort appointments by date and time
    filteredAppointments.sort((a, b) => {
      // First compare dates
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;

      // If dates are the same, compare start times
      return a.startTime.localeCompare(b.startTime);
    });

    res.status(200).json({
      success: true,
      count: filteredAppointments.length,
      data: filteredAppointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single appointment
 * @route GET /api/appointments/:id
 * @access Private
 */
export const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For development/demo purposes, use mock data
    // In production, this would fetch from the database

    // Mock appointments (same as in getAppointments)
    const mockAppointments = [
      {
        _id: '1',
        patient: {
          _id: '1',
          firstName: 'Ahmed',
          lastName: 'Khan',
          email: 'ahmed@example.com',
          phoneNumber: '+92 300 1234567',
          dateOfBirth: '1990-05-15',
          gender: 'male'
        },
        dermatologist: {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Ali',
          email: 'doctor@pakskincare.com'
        },
        date: new Date().toISOString().split('T')[0], // Today
        startTime: '09:00',
        endTime: '09:30',
        status: AppointmentStatus.CONFIRMED,
        reason: 'Acne consultation',
        notes: 'Patient has been experiencing severe acne for 3 months',
        createdBy: {
          _id: '4',
          firstName: 'Front',
          lastName: 'Desk'
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        patient: {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Malik',
          email: 'fatima@example.com',
          phoneNumber: '+92 300 7654321',
          dateOfBirth: '1985-08-20',
          gender: 'female'
        },
        dermatologist: {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Ali',
          email: 'doctor@pakskincare.com'
        },
        date: new Date().toISOString().split('T')[0], // Today
        startTime: '10:00',
        endTime: '10:30',
        status: AppointmentStatus.SCHEDULED,
        reason: 'Eczema follow-up',
        notes: 'Check progress with prescribed treatment',
        createdBy: {
          _id: '4',
          firstName: 'Front',
          lastName: 'Desk'
        },
        createdAt: new Date().toISOString()
      }
    ];

    // Find the appointment by ID
    const appointment = mockAppointments.find(a => a._id === req.params.id);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check if user has access to this appointment (if user is a dermatologist)
    if (
      req.user &&
      req.user.role === UserRole.DERMATOLOGIST &&
      appointment.dermatologist._id !== req.user.id
    ) {
      return next(new AppError('Not authorized to access this appointment', 403));
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new appointment
 * @route POST /api/appointments
 * @access Private
 */
export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patient, dermatologist, date, startTime, endTime, reason, notes, status } = req.body;

    // Check if dermatologist exists and is a dermatologist
    const dermatologistUser = await User.findById(dermatologist);
    if (!dermatologistUser || dermatologistUser.role !== UserRole.DERMATOLOGIST) {
      return next(new AppError('Invalid dermatologist', 400));
    }

    // Check for scheduling conflicts
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    const existingAppointment = await Appointment.findOne({
      dermatologist,
      date: appointmentDate,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (existingAppointment) {
      return next(new AppError('Scheduling conflict with existing appointment', 400));
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient,
      dermatologist,
      date: appointmentDate,
      startTime,
      endTime,
      reason,
      notes,
      status: status || AppointmentStatus.SCHEDULED,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment
 * @route PUT /api/appointments/:id
 * @access Private
 */
export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, startTime, endTime, reason, notes, status } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check if user has access to update this appointment
    if (
      req.user.role === UserRole.DERMATOLOGIST &&
      appointment.dermatologist.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to update this appointment', 403));
    }

    // Check for scheduling conflicts if date or time is being updated
    if (date && startTime && endTime) {
      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);

      const existingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        dermatologist: appointment.dermatologist,
        date: appointmentDate,
        $or: [
          { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
          { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
        ],
      });

      if (existingAppointment) {
        return next(new AppError('Scheduling conflict with existing appointment', 400));
      }

      appointment.date = appointmentDate;
      appointment.startTime = startTime;
      appointment.endTime = endTime;
    }

    // Update other fields
    if (reason) appointment.reason = reason;
    if (notes) appointment.notes = notes;
    if (status) appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete appointment
 * @route DELETE /api/appointments/:id
 * @access Private
 */
export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check if user has access to delete this appointment
    if (
      req.user.role === UserRole.DERMATOLOGIST &&
      appointment.dermatologist.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to delete this appointment', 403));
    }

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status
 * @route PATCH /api/appointments/:id/status
 * @access Private
 */
export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      return next(new AppError('Invalid status', 400));
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check if user has access to update this appointment
    if (
      req.user.role === UserRole.DERMATOLOGIST &&
      appointment.dermatologist.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to update this appointment', 403));
    }

    appointment.status = status as AppointmentStatus;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
