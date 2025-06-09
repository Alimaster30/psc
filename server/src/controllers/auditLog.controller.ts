import { Request, Response, NextFunction } from 'express';
import AuditLog, { AuditAction, AuditSeverity } from '../models/auditLog.model';
import { AppError } from '../middlewares/error.middleware';
import { UserRole } from '../models/user.model';

/**
 * Get all audit logs with filtering and pagination
 * @route GET /api/audit-logs
 * @access Private (Admin only)
 */
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access audit logs', 403));
    }

    const {
      page = 1,
      limit = 50,
      action,
      severity,
      resource,
      userId,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build query
    const query: any = {};

    // Filter by action
    if (action) {
      query.action = action;
    }

    // Filter by severity
    if (severity) {
      query.severity = severity;
    }

    // Filter by resource
    if (resource) {
      query.resource = resource;
    }

    // Filter by user
    if (userId) {
      query.userId = userId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    // Search in details, userEmail, or userName
    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await AuditLog.countDocuments(query);

    // Get audit logs
    const auditLogs = await AuditLog.find(query)
      .populate('userId', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: auditLogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit log statistics
 * @route GET /api/audit-logs/stats
 * @access Private (Admin only)
 */
export const getAuditLogStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access audit logs', 403));
    }

    const { period = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total logs in period
    const totalLogs = await AuditLog.countDocuments({
      timestamp: { $gte: startDate },
    });

    // Get logs by severity
    const logsBySeverity = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get logs by action
    const logsByAction = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get logs by resource
    const logsByResource = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get failed operations
    const failedOperations = await AuditLog.countDocuments({
      timestamp: { $gte: startDate },
      success: false,
    });

    // Get unique users
    const uniqueUsers = await AuditLog.distinct('userId', {
      timestamp: { $gte: startDate },
      userId: { $exists: true },
    });

    // Get recent critical events
    const criticalEvents = await AuditLog.find({
      timestamp: { $gte: startDate },
      severity: AuditSeverity.CRITICAL,
    })
      .populate('userId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        period,
        totalLogs,
        failedOperations,
        uniqueUsers: uniqueUsers.length,
        logsBySeverity,
        logsByAction,
        logsByResource,
        criticalEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit log by ID
 * @route GET /api/audit-logs/:id
 * @access Private (Admin only)
 */
export const getAuditLogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to access audit logs', 403));
    }

    const auditLog = await AuditLog.findById(req.params.id).populate('userId', 'firstName lastName email role');

    if (!auditLog) {
      return next(new AppError('Audit log not found', 404));
    }

    res.status(200).json({
      success: true,
      data: auditLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export audit logs to CSV
 * @route GET /api/audit-logs/export
 * @access Private (Admin only)
 */
export const exportAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return next(new AppError('Not authorized to export audit logs', 403));
    }

    const { startDate, endDate } = req.query;

    // Build query
    const query: any = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    // Get audit logs
    const auditLogs = await AuditLog.find(query)
      .populate('userId', 'firstName lastName email role')
      .sort({ timestamp: -1 });

    // Convert to CSV format
    const csvHeader = 'Timestamp,User,Email,Role,Action,Resource,Resource ID,Details,Severity,IP Address,Success,Error Message\n';
    const csvData = auditLogs.map(log => {
      const user = log.userId as any;
      return [
        log.timestamp.toISOString(),
        log.userName || (user ? `${user.firstName} ${user.lastName}` : 'Unknown'),
        log.userEmail || (user ? user.email : 'Unknown'),
        log.userRole || (user ? user.role : 'Unknown'),
        log.action,
        log.resource,
        log.resourceId || '',
        `"${log.details.replace(/"/g, '""')}"`,
        log.severity,
        log.ipAddress || '',
        log.success,
        log.errorMessage || '',
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvData;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);

    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
