import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { generateToken } from '../utils/jwt';

/**
 * Create a new user (Admin only)
 * @route POST /api/users
 * @access Private (Admin only)
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
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

    // For development/demo purposes, use mock data
    // In production, this would use the database query below
    // const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    // Mock data for demonstration
    const mockUsers = [
      {
        _id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@psc.com',
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        firstName: 'Fatima',
        lastName: 'Ali',
        email: 'doctor@psc.com',
        role: UserRole.DERMATOLOGIST,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        firstName: 'Imran',
        lastName: 'Ahmed',
        email: 'imran@psc.com',
        role: UserRole.DERMATOLOGIST,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        firstName: 'Front',
        lastName: 'Desk',
        email: 'receptionist@psc.com',
        role: UserRole.RECEPTIONIST,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filter mock users based on role if provided
    const filteredUsers = role
      ? mockUsers.filter(user => user.role === role)
      : mockUsers;

    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers,
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
    const user = await User.findById(req.params.id).select('-password');

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
