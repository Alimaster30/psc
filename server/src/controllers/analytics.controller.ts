import { Request, Response, NextFunction } from 'express';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import Billing from '../models/billing.model';
import { UserRole } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

// Define interfaces for the analytics data
interface MonthlyData {
  month: number;
  count: number;
}

interface YearlyData {
  year: number;
  count: number;
}

interface RevenueData {
  month?: number;
  year?: number;
  total: number;
}

/**
 * Get patient growth analytics
 * @route GET /api/analytics/patient-growth
 * @access Private (Admin only)
 */
export const getPatientGrowth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access analytics', 403));
    }

    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    let patientGrowth: any[] = [];

    if (period === 'monthly') {
      // Get monthly patient growth for the specified year
      patientGrowth = await Patient.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing months with zero
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const result = months.map((month) => {
        const found = patientGrowth.find((item) => 
          'month' in item ? item.month === month : false
        );
        return {
          month,
          count: found ? found.count : 0,
        };
      });

      patientGrowth = result as MonthlyData[];
    } else if (period === 'yearly') {
      // Get yearly patient growth for the last 5 years
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;

      patientGrowth = await Patient.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${startYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $year: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing years with zero
      const years = Array.from({ length: 5 }, (_, i) => startYear + i);
      const result = years.map((year) => {
        const found = patientGrowth.find((item) => 
          'year' in item ? item.year === year : false
        );
        return {
          year,
          count: found ? found.count : 0,
        };
      });

      patientGrowth = result as YearlyData[];
    } else {
      return next(new AppError('Invalid period. Use "monthly" or "yearly"', 400));
    }

    res.status(200).json({
      success: true,
      data: patientGrowth,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics
 * @route GET /api/analytics/revenue
 * @access Private (Admin only)
 */
export const getRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access analytics', 403));
    }

    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    let revenue: any[] = [];

    if (period === 'monthly') {
      // Get monthly revenue for the specified year
      revenue = await Billing.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$date' },
            total: { $sum: '$amountPaid' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing months with zero
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const result = months.map((month) => {
        const found = revenue.find((item) => 
          'month' in item ? item.month === month : false
        );
        return {
          month,
          total: found ? found.total : 0,
        };
      });

      revenue = result as RevenueData[];
    } else if (period === 'yearly') {
      // Get yearly revenue for the last 5 years
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;

      revenue = await Billing.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(`${startYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $year: '$date' },
            total: { $sum: '$amountPaid' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing years with zero
      const years = Array.from({ length: 5 }, (_, i) => startYear + i);
      const result = years.map((year) => {
        const found = revenue.find((item) => 
          'year' in item ? item.year === year : false
        );
        return {
          year,
          total: found ? found.total : 0,
        };
      });

      revenue = result as RevenueData[];
    } else {
      return next(new AppError('Invalid period. Use "monthly" or "yearly"', 400));
    }

    res.status(200).json({
      success: true,
      data: revenue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment analytics
 * @route GET /api/analytics/appointments
 * @access Private (Admin only)
 */
export const getAppointmentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access analytics', 403));
    }

    // Get appointment count by status
    const appointmentsByStatus = await Appointment.aggregate([
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

    // Get appointment count by month for the current year
    const currentYear = new Date().getFullYear();
    const appointmentsByMonth = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill in missing months with zero
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const appointmentsByMonthResult = months.map((month) => {
      const found = appointmentsByMonth.find((item) => item._id === month);
      return {
        month,
        count: found ? found.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: appointmentsByStatus,
        byMonth: appointmentsByMonthResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top prescribed medications
 * @route GET /api/analytics/top-medications
 * @access Private (Admin only)
 */
export const getTopMedications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access analytics', 403));
    }

    const { limit = 10 } = req.query;

    // Get top prescribed medications
    const topMedications = await Prescription.aggregate([
      { $unwind: '$medications' },
      {
        $group: {
          _id: '$medications.name',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: parseInt(limit as string, 10),
      },
    ]);

    res.status(200).json({
      success: true,
      data: topMedications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard summary
 * @route GET /api/analytics/dashboard-summary
 * @access Private (Admin only)
 */
export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access analytics', 403));
    }

    // Get total patients
    const totalPatients = await Patient.countDocuments();

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments();

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    // Get total revenue
    const totalRevenue = await Billing.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' },
        },
      },
    ]);

    // Get this month's revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    const monthlyRevenue = await Billing.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalAppointments,
        todayAppointments,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
