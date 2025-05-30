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
    const { status, date, startDate, endDate, dermatologist, patient, search } = req.query;
    console.log('getAppointments called with query:', req.query);

    // Build query
    const query: any = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    } else if (date) {
      // Filter by single date
      const selectedDate = new Date(date as string);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = { $gte: selectedDate, $lt: nextDay };
    }

    // Filter by dermatologist
    if (dermatologist) {
      query.dermatologist = dermatologist;
    }

    // Filter by patient
    if (patient) {
      query.patient = patient;
    }

    // If user is a dermatologist, only show their appointments
    if (req.user && req.user.role === UserRole.DERMATOLOGIST) {
      query.dermatologist = req.user.id;
    }

    console.log('Query before search:', query);

    // Find appointments with populated references
    let appointmentsQuery = Appointment.find(query)
      .populate('patient', 'firstName lastName email phoneNumber')
      .populate('dermatologist', 'firstName lastName')
      .populate('service', 'name price category')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1, startTime: 1 });

    const appointments = await appointmentsQuery;

    // Apply search filter after population (since we need to search in populated fields)
    let filteredAppointments = appointments;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      console.log('Applying search filter:', searchTerm);

      filteredAppointments = appointments.filter(appointment => {
        const patient = appointment.patient as any;
        const dermatologist = appointment.dermatologist as any;

        const patientName = `${patient?.firstName || ''} ${patient?.lastName || ''}`.toLowerCase();
        const doctorName = `${dermatologist?.firstName || ''} ${dermatologist?.lastName || ''}`.toLowerCase();
        const reason = (appointment.reason || '').toLowerCase();
        const notes = (appointment.notes || '').toLowerCase();

        return patientName.includes(searchTerm) ||
               doctorName.includes(searchTerm) ||
               reason.includes(searchTerm) ||
               notes.includes(searchTerm);
      });
    }

    console.log(`Found ${filteredAppointments.length} appointments`);

    res.status(200).json({
      success: true,
      count: filteredAppointments.length,
      data: filteredAppointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
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
    // Find appointment by ID with populated references
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phoneNumber dateOfBirth gender')
      .populate('dermatologist', 'firstName lastName email')
      .populate('service', 'name price category description')
      .populate('createdBy', 'firstName lastName');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check if user has access to this appointment (if user is a dermatologist)
    if (
      req.user &&
      req.user.role === UserRole.DERMATOLOGIST &&
      appointment.dermatologist._id.toString() !== req.user.id
    ) {
      return next(new AppError('Not authorized to access this appointment', 403));
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
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
    const { patient, dermatologist, service, date, startTime, endTime, reason, notes, status } = req.body;

    console.log('Creating appointment with data:', {
      patient,
      dermatologist,
      service,
      date,
      startTime,
      endTime,
      reason,
      notes,
      status,
      createdBy: req.user?.id
    });

    // Check if dermatologist exists and is a dermatologist
    const dermatologistUser = await User.findById(dermatologist);
    if (!dermatologistUser) {
      return next(new AppError('Dermatologist not found', 400));
    }

    if (dermatologistUser.role !== UserRole.DERMATOLOGIST) {
      return next(new AppError('Selected user is not a dermatologist', 400));
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
      service,
      date: appointmentDate,
      startTime,
      endTime,
      reason,
      notes,
      status: status || AppointmentStatus.SCHEDULED,
      createdBy: req.user?.id || dermatologist, // Use authenticated user or fallback to the dermatologist
    });

    // Populate the appointment with patient, dermatologist, and service details
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phoneNumber' },
      { path: 'dermatologist', select: 'firstName lastName' },
      { path: 'service', select: 'name price category' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    if (error.name === 'ValidationError') {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      return next(new AppError(`Validation error: ${Object.values(error.errors).map((err: any) => err.message).join(', ')}`, 400));
    }

    // Return a more detailed error message
    return res.status(400).json({
      success: false,
      message: error.message,
      error: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

/**
 * Get available appointment times for a specific date and doctor
 * @route GET /api/appointments/available-times
 * @access Private
 */
export const getAvailableTimes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date, doctorId } = req.query;

    if (!date || !doctorId) {
      return next(new AppError('Date and doctor ID are required', 400));
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== UserRole.DERMATOLOGIST) {
      return next(new AppError('Invalid doctor', 400));
    }

    // Define all possible time slots (30-minute intervals from 9 AM to 5 PM)
    const allTimeSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ];

    // Convert date string to Date object
    const appointmentDate = new Date(date as string);
    appointmentDate.setHours(0, 0, 0, 0);

    // Find existing appointments for the doctor on the specified date
    const existingAppointments = await Appointment.find({
      dermatologist: doctorId,
      date: appointmentDate,
      status: { $ne: AppointmentStatus.CANCELLED } // Exclude cancelled appointments
    });

    // Get booked time slots
    const bookedTimeSlots = existingAppointments.map(appointment => appointment.startTime);

    // Filter out booked time slots
    const availableTimeSlots = allTimeSlots.filter(timeSlot => !bookedTimeSlots.includes(timeSlot));

    res.status(200).json({
      success: true,
      data: availableTimeSlots,
    });
  } catch (error) {
    console.error('Error getting available times:', error);
    next(error);
  }
};
