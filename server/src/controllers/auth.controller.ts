import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || UserRole.RECEPTIONIST,
      phoneNumber,
    });

    // Generate token
    const token = generateToken({ id: user._id });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // For development/demo purposes, use mock data
    // In production, this would use the database query
    // const user = await User.findOne({ email });

    // Mock user data for demonstration
    const mockUsers = [
      {
        _id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@psc.com',
        password: 'Admin123!',
        role: UserRole.ADMIN,
        isActive: true
      },
      {
        _id: '2',
        firstName: 'Dr',
        lastName: 'Dermatologist',
        email: 'doctor@psc.com',
        password: 'Doctor123!',
        role: UserRole.DERMATOLOGIST,
        isActive: true
      },
      {
        _id: '3',
        firstName: 'Front',
        lastName: 'Desk',
        email: 'receptionist@psc.com',
        password: 'Reception123!',
        role: UserRole.RECEPTIONIST,
        isActive: true
      }
    ];

    // Find user by email
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('User account is deactivated', 401));
    }

    // Check if password matches
    // In a real app, we would use bcrypt.compare
    // const isMatch = await user.comparePassword(password);
    const isMatch = user.password === password;

    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate token
    const token = generateToken({ id: user._id });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For development/demo purposes, use mock data
    // In production, this would use the database query
    // const user = await User.findById(req.user.id).select('-password');

    // Mock user data for demonstration
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
        firstName: 'Dr',
        lastName: 'Dermatologist',
        email: 'doctor@psc.com',
        role: UserRole.DERMATOLOGIST,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        firstName: 'Front',
        lastName: 'Desk',
        email: 'receptionist@psc.com',
        role: UserRole.RECEPTIONIST,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Find user by ID
    const user = mockUsers.find(u => u._id === req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/me
 * @access Private
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        phoneNumber,
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
