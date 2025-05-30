import { Request, Response, NextFunction } from 'express';
import Service from '../models/service.model';
import { AppError } from '../middlewares/error.middleware';

/**
 * Get all services
 * @route GET /api/services
 * @access Public
 */
export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await Service.find().sort({ category: 1, price: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 * @route GET /api/services/:id
 * @access Public
 */
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get services by category
 * @route GET /api/services/category/:category
 * @access Public
 */
export const getServicesByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await Service.find({ category: req.params.category }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new service
 * @route POST /api/services
 * @access Private (Admin only)
 */
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update service
 * @route PUT /api/services/:id
 * @access Private (Admin only)
 */
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service
 * @route DELETE /api/services/:id
 * @access Private (Admin only)
 */
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
