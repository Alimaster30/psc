import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/user.model';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import { AppError } from '../middlewares/error.middleware';
import { generateToken } from '../utils/jwt';

/**
 * Create a new user (Admin only)
 * @route POST /api/users
 * @access Private (Admin only)
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating user with data:', req.body);
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists:', email);
      return next(new AppError('User with this email already exists', 400));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || UserRole.RECEPTIONIST,
      phoneNumber,
      isActive: true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    next(error);
  }
};

/**
 * Get all users
 * @route GET /api/users
 * @access Private (Admin only)
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.query;
    const filter: any = {};

    // Apply role filter if provided
    if (role) {
      filter.role = role;
    }

    // Use real MongoDB data
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    // Check if there are any users in the database
    if (users.length === 0) {
      // If no users exist, create default users
      if (await User.countDocuments() === 0) {
        // Create default admin user
        await User.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@psc.com',
          password: 'password123',
          role: UserRole.ADMIN,
          isActive: true,
        });

        // Create default dermatologist user
        await User.create({
          firstName: 'Dr',
          lastName: 'Dermatologist',
          email: 'doctor@psc.com',
          password: 'password123',
          role: UserRole.DERMATOLOGIST,
          isActive: true,
        });

        // Create default receptionist user
        await User.create({
          firstName: 'Front',
          lastName: 'Desk',
          email: 'receptionist@psc.com',
          password: 'password123',
          role: UserRole.RECEPTIONIST,
          isActive: true,
        });

        // Fetch users again after creating defaults
        const defaultUsers = await User.find(filter).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          count: defaultUsers.length,
          data: defaultUsers,
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin only)
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('getUserById called with ID:', req.params.id);

    // Check if ID is valid
    if (!req.params.id || req.params.id === 'undefined') {
      console.log('Invalid user ID provided:', req.params.id);
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return next(new AppError('User not found', 404));
    }

    console.log('User found:', user.firstName, user.lastName);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log('Error in getUserById:', error);
    next(error);
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private (Admin only)
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, role, phoneNumber, isActive } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return next(new AppError('Email is already taken', 400));
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        isActive,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status
 * @route PATCH /api/users/:id/status
 * @access Private (Admin only)
 */
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return next(new AppError('isActive must be a boolean value', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Don't allow deactivating the last admin
    if (user.role === UserRole.ADMIN && !isActive) {
      const activeAdminCount = await User.countDocuments({
        role: UserRole.ADMIN,
        isActive: true,
        _id: { $ne: req.params.id }
      });
      if (activeAdminCount === 0) {
        return next(new AppError('Cannot deactivate the last active admin user', 400));
      }
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Don't allow deleting the last admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await User.countDocuments({ role: UserRole.ADMIN });
      if (adminCount <= 1) {
        return next(new AppError('Cannot delete the last admin user', 400));
      }
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard data for the current user
 * @route GET /api/users/me/dashboard
 * @access Private
 */
export const getUserDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dashboardData: any = {};

    if (userRole === UserRole.DERMATOLOGIST) {
      // For dermatologists, get their specific data

      // Count patients assigned to this dermatologist
      const totalPatients = await Patient.countDocuments();

      // Count all appointments for this dermatologist
      const totalAppointments = await Appointment.countDocuments({
        dermatologist: userId
      });

      // Count prescriptions created by this dermatologist
      const totalPrescriptions = await Prescription.countDocuments({
        createdBy: userId
      });

      // Count today's appointments for this dermatologist
      const todayAppointments = await Appointment.countDocuments({
        dermatologist: userId,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      // Get appointment status data for this dermatologist
      const appointmentsByStatus = await Appointment.aggregate([
        {
          $match: { dermatologist: userId }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      dashboardData = {
        totalPatients,
        totalAppointments,
        totalPrescriptions,
        todayAppointments,
        appointmentsByStatus,
      };
    } else if (userRole === UserRole.RECEPTIONIST) {
      // For receptionists, get general clinic data

      // Count all patients
      const totalPatients = await Patient.countDocuments();

      // Count all appointments
      const totalAppointments = await Appointment.countDocuments();

      // Count all prescriptions
      const totalPrescriptions = await Prescription.countDocuments();

      // Count today's appointments
      const todayAppointments = await Appointment.countDocuments({
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      dashboardData = {
        totalPatients,
        totalAppointments,
        totalPrescriptions,
        todayAppointments,
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};
