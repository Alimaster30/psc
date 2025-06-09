import { Request, Response, NextFunction } from 'express';
import AuditLogService from '../services/auditLog.service';
import { AuditAction } from '../models/auditLog.model';

/**
 * Middleware to automatically log API requests
 */
export const auditLogMiddleware = (action: AuditAction, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body: any) {
      // Log the activity after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract resource ID from request params or response body
        const resourceId = req.params.id || req.params.patientId || req.params.appointmentId || body?.data?._id;
        
        // Determine details based on action and resource
        let details = `${action.replace('_', ' ').toLowerCase()} ${resource.toLowerCase()}`;
        if (resourceId) {
          details += ` (ID: ${resourceId})`;
        }

        // Log the activity
        if (req.user) {
          AuditLogService.log({
            userId: req.user._id?.toString(),
            userEmail: req.user.email,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            userRole: req.user.role,
            action,
            resource,
            resourceId: resourceId?.toString(),
            details,
          }, req).catch(error => {
            console.error('Audit logging failed:', error);
          });
        }
      }

      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Middleware to log authentication attempts
 */
export const auditAuthMiddleware = (action: AuditAction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body: any) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      const userEmail = req.body.email || 'Unknown';
      const errorMessage = !success ? body?.message || 'Authentication failed' : undefined;

      // Log authentication attempt
      AuditLogService.logAuth(action, userEmail, success, req, errorMessage).catch(error => {
        console.error('Audit logging failed:', error);
      });

      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Middleware to log data access (viewing sensitive information)
 */
export const auditDataAccessMiddleware = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body: any) {
      // Only log successful data access
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const resourceId = req.params.id || req.params.patientId;
        
        AuditLogService.log({
          userId: req.user._id?.toString(),
          userEmail: req.user.email,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          userRole: req.user.role,
          action: AuditAction.PATIENT_VIEWED, // This will be customized based on resource
          resource,
          resourceId: resourceId?.toString(),
          details: `Accessed ${resource.toLowerCase()} data${resourceId ? ` (ID: ${resourceId})` : ''}`,
        }, req).catch(error => {
          console.error('Audit logging failed:', error);
        });
      }

      // Call original json method
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Middleware to log security events (unauthorized access attempts)
 */
export const auditSecurityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Store original res.status to intercept 403/401 responses
  const originalStatus = res.status;
  
  res.status = function(code: number) {
    if (code === 401 || code === 403) {
      // Log security event
      AuditLogService.logSecurityEvent(
        code === 401 ? AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT : AuditAction.PERMISSION_DENIED,
        req.user,
        req.originalUrl,
        req,
        `${code === 401 ? 'Unauthorized access' : 'Permission denied'} to ${req.method} ${req.originalUrl}`
      ).catch(error => {
        console.error('Audit logging failed:', error);
      });
    }

    // Call original status method
    return originalStatus.call(this, code);
  };

  next();
};
