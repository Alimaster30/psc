import { Request, Response, NextFunction } from 'express';
import Patient from '../models/patient.model';
import Appointment from '../models/appointment.model';
import Prescription from '../models/prescription.model';
import Billing from '../models/billing.model';
import { UserRole } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { DEPLOYMENT_DATE } from '../config/deployment';

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
  revenue: number;
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

    const { period = 'month', year = new Date().getFullYear() } = req.query;

    let patientGrowth: any[] = [];
    const today = new Date();

    if (period === 'week') {
      // Get daily patient growth for the last 7 days
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      console.log(`Fetching patient growth for last 7 days: ${startDate} to ${endDate}`);

      patientGrowth = await Patient.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing days with zero
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const found = patientGrowth.find((item) => item._id === dateStr);
        result.push({
          date: dateStr,
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          count: found ? found.count : 0,
        });
      }

      patientGrowth = result;
    } else if (period === 'month') {
      // Get monthly patient growth for the specified year
      console.log(`Fetching patient growth for year: ${year}`);

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

      console.log('Raw patient growth data:', patientGrowth);

      // Fill in missing months with zero
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const result = months.map((month) => {
        const found = patientGrowth.find((item) => item._id === month);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          month,
          monthName: monthNames[month - 1],
          count: found ? found.count : 0,
        };
      });

      console.log('Final patient growth result:', result);

      patientGrowth = result as MonthlyData[];
    } else if (period === 'quarter') {
      // Get quarterly patient growth for the current year
      console.log(`Fetching quarterly patient growth for year: ${year}`);

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
            _id: {
              $ceil: { $divide: [{ $month: '$createdAt' }, 3] }
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing quarters with zero
      const quarters = [1, 2, 3, 4];
      const result = quarters.map((quarter) => {
        const found = patientGrowth.find((item) => item._id === quarter);
        return {
          quarter,
          quarterName: `Q${quarter}`,
          count: found ? found.count : 0,
        };
      });

      patientGrowth = result;
    } else if (period === 'year') {
      // Get yearly patient growth for the last 5 years
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;

      console.log(`Fetching yearly patient growth from ${startYear} to ${currentYear}`);

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
        const found = patientGrowth.find((item) => item._id === year);
        return {
          year,
          count: found ? found.count : 0,
        };
      });

      patientGrowth = result as YearlyData[];
    } else {
      return next(new AppError('Invalid period. Use "week", "month", "quarter", or "year"', 400));
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

    const { period = 'month', year = new Date().getFullYear() } = req.query;

    let revenue: any[] = [];
    const today = new Date();

    if (period === 'week') {
      // Get daily revenue for the last 7 days
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      console.log(`Fetching revenue for last 7 days: ${startDate} to ${endDate}`);

      revenue = await Billing.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            },
            total: { $sum: '$amountPaid' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing days with zero
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const found = revenue.find((item) => item._id === dateStr);
        result.push({
          date: dateStr,
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: found ? found.total : 0,
        });
      }

      revenue = result;
    } else if (period === 'month') {
      // Get monthly revenue for the specified year (only after deployment date)
      const startDate = new Date(`${year}-01-01`);
      // Use the later of the two dates: start of year or deployment date
      const effectiveStartDate = startDate > DEPLOYMENT_DATE ? startDate : DEPLOYMENT_DATE;

      revenue = await Billing.aggregate([
        {
          $match: {
            date: {
              $gte: effectiveStartDate,
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
          $project: {
            _id: '$_id',
            month: '$_id',
            total: 1
          }
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      console.log('Raw monthly revenue data:', revenue);

      // Extract month from _id object and transform the data
      revenue = revenue.map(item => ({
        month: typeof item._id === 'object' ? item._id.$month || item._id : item._id,
        revenue: item.total  // Use 'revenue' property to match frontend expectations
      }));

      // Fill in missing months with zero
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const result = months.map((month) => {
        const found = revenue.find(item => item.month === month);
        return {
          month,
          revenue: found ? found.revenue : 0,  // Use 'revenue' property
        };
      });

      revenue = result as RevenueData[];
      console.log('Final monthly revenue result:', result);
    } else if (period === 'quarter') {
      // Get quarterly revenue for the current year
      console.log(`Fetching quarterly revenue for year: ${year}`);

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
            _id: {
              $ceil: { $divide: [{ $month: '$date' }, 3] }
            },
            total: { $sum: '$amountPaid' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Fill in missing quarters with zero
      const quarters = [1, 2, 3, 4];
      const result = quarters.map((quarter) => {
        const found = revenue.find((item) => item._id === quarter);
        return {
          quarter,
          quarterName: `Q${quarter}`,
          revenue: found ? found.total : 0,
        };
      });

      revenue = result;
    } else if (period === 'year') {
      // Get yearly revenue for the last 5 years (only after deployment date)
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;

      // Calculate the start date (either Jan 1 of startYear or deployment date, whichever is later)
      const startDate = new Date(`${startYear}-01-01`);
      const effectiveStartDate = startDate > DEPLOYMENT_DATE ? startDate : DEPLOYMENT_DATE;

      revenue = await Billing.aggregate([
        {
          $match: {
            date: {
              $gte: effectiveStartDate,
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
          $project: {
            _id: '$_id',
            year: '$_id',
            total: 1
          }
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      console.log('Raw yearly revenue data:', revenue);

      // Extract year from _id object and transform the data
      revenue = revenue.map(item => ({
        year: typeof item._id === 'object' ? item._id.$year || item._id : item._id,
        revenue: item.total  // Use 'revenue' property to match frontend expectations
      }));

      // Fill in missing years with zero
      const years = Array.from({ length: 5 }, (_, i) => startYear + i);
      const result = years.map((year) => {
        const found = revenue.find(item => item.year === year);
        return {
          year,
          revenue: found ? found.revenue : 0,  // Use 'revenue' property
        };
      });

      revenue = result as RevenueData[];
      console.log('Final yearly revenue result:', result);
    } else {
      return next(new AppError('Invalid period. Use "week", "month", "quarter", or "year"', 400));
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

    // Get total prescriptions
    const totalPrescriptions = await Prescription.countDocuments();

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

    // Use deployment date from config - this will be used to reset total revenue
    // Update this date in config/deployment.ts before deploying

    // Get total revenue (only counting from deployment date)
    const totalRevenue = await Billing.aggregate([
      {
        $match: {
          date: { $gte: DEPLOYMENT_DATE }
        }
      },
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
        totalPrescriptions,
        todayAppointments,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
