import { Request, Response, NextFunction } from 'express';
import { RolePermission } from '../models/permission.model';
import { AppError } from './error.middleware';
import AuditLogService from '../services/auditLog.service';
import { AuditAction } from '../models/auditLog.model';

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const userRole = req.user.role;

      // Get role permissions from database
      const rolePermission = await RolePermission.findOne({ 
        role: userRole, 
        isActive: true 
      });

      // Check if role has the required permission
      const hasPermission = rolePermission?.permissions.includes(permission) || false;

      if (!hasPermission) {
        // Log security event
        await AuditLogService.logSecurityEvent(
          AuditAction.PERMISSION_DENIED,
          req.user,
          req.originalUrl,
          req,
          `Permission denied: ${permission} for role ${userRole}`
        );

        return next(new AppError(`Permission denied: ${permission}`, 403));
      }

      // User has permission, continue
      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      next(new AppError('Permission check failed', 500));
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 */
export const requireAnyPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const userRole = req.user.role;

      // Get role permissions from database
      const rolePermission = await RolePermission.findOne({ 
        role: userRole, 
        isActive: true 
      });

      // Check if role has any of the required permissions
      const hasAnyPermission = permissions.some(permission => 
        rolePermission?.permissions.includes(permission)
      );

      if (!hasAnyPermission) {
        // Log security event
        await AuditLogService.logSecurityEvent(
          AuditAction.PERMISSION_DENIED,
          req.user,
          req.originalUrl,
          req,
          `Permission denied: ${permissions.join(' or ')} for role ${userRole}`
        );

        return next(new AppError(`Permission denied: requires one of ${permissions.join(', ')}`, 403));
      }

      // User has at least one required permission, continue
      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      next(new AppError('Permission check failed', 500));
    }
  };
};

/**
 * Middleware to check if user has all of the specified permissions
 */
export const requireAllPermissions = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const userRole = req.user.role;

      // Get role permissions from database
      const rolePermission = await RolePermission.findOne({ 
        role: userRole, 
        isActive: true 
      });

      // Check if role has all of the required permissions
      const hasAllPermissions = permissions.every(permission => 
        rolePermission?.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        // Find missing permissions
        const missingPermissions = permissions.filter(permission => 
          !rolePermission?.permissions.includes(permission)
        );

        // Log security event
        await AuditLogService.logSecurityEvent(
          AuditAction.PERMISSION_DENIED,
          req.user,
          req.originalUrl,
          req,
          `Permission denied: missing ${missingPermissions.join(', ')} for role ${userRole}`
        );

        return next(new AppError(`Permission denied: missing ${missingPermissions.join(', ')}`, 403));
      }

      // User has all required permissions, continue
      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      next(new AppError('Permission check failed', 500));
    }
  };
};

/**
 * Helper function to check permission programmatically
 */
export const checkUserPermission = async (userRole: string, permission: string): Promise<boolean> => {
  try {
    const rolePermission = await RolePermission.findOne({ 
      role: userRole, 
      isActive: true 
    });

    return rolePermission?.permissions.includes(permission) || false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

/**
 * Helper function to get all permissions for a role
 */
export const getUserPermissions = async (userRole: string): Promise<string[]> => {
  try {
    const rolePermission = await RolePermission.findOne({ 
      role: userRole, 
      isActive: true 
    });

    return rolePermission?.permissions || [];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};
