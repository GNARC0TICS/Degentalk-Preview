/**
 * Permission Validation Middleware
 * 
 * Type-safe permission checking using canonical Role and User types.
 * Provides middleware for role-based access control.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@core/logger';
import type { User, UserRole, Role } from '@shared/types/entities';
import type { UserId, RoleId } from '@shared/types/ids';

/**
 * Extended Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Permission scope definitions
 */
export enum PermissionScope {
  // Forum permissions
  FORUM_READ = 'forum.read',
  FORUM_WRITE = 'forum.write',
  FORUM_MODERATE = 'forum.moderate',
  FORUM_ADMIN = 'forum.admin',
  
  // User permissions
  USER_VIEW = 'user.view',
  USER_EDIT = 'user.edit',
  USER_BAN = 'user.ban',
  USER_DELETE = 'user.delete',
  
  // Admin permissions
  ADMIN_ACCESS = 'admin.access',
  ADMIN_SETTINGS = 'admin.settings',
  ADMIN_SYSTEM = 'admin.system',
  ADMIN_ANALYTICS = 'admin.analytics',
  
  // Economy permissions
  ECONOMY_VIEW = 'economy.view',
  ECONOMY_MANAGE = 'economy.manage',
  ECONOMY_ADMIN = 'economy.admin',
  
  // Content permissions
  CONTENT_CREATE = 'content.create',
  CONTENT_EDIT = 'content.edit',
  CONTENT_DELETE = 'content.delete',
  CONTENT_MODERATE = 'content.moderate'
}

/**
 * Role hierarchy for permission inheritance
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'user': 0,
  'moderator': 1,
  'admin': 2,
  'super-admin': 3,
  'developer': 4
};

/**
 * Check if user has a specific role or higher
 */
export function hasRole(user: User | undefined, requiredRole: UserRole): boolean {
  if (!user) return false;
  
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | undefined, permission: PermissionScope): boolean {
  if (!user) return false;
  
  // Super-admin and developer have all permissions
  if (user.role === 'super-admin' || user.role === 'developer') {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = getRolePermissions(user.role);
  if (rolePermissions.includes(permission)) {
    return true;
  }
  
  // Check user-specific permissions if available
  if (user.pluginData?.permissions) {
    const userPermissions = user.pluginData.permissions as string[];
    return userPermissions.includes(permission);
  }
  
  return false;
}

/**
 * Get default permissions for a role
 */
function getRolePermissions(role: UserRole): PermissionScope[] {
  switch (role) {
    case 'developer':
      return Object.values(PermissionScope);
      
    case 'super-admin':
      return Object.values(PermissionScope);
      
    case 'admin':
      return [
        PermissionScope.FORUM_READ,
        PermissionScope.FORUM_WRITE,
        PermissionScope.FORUM_MODERATE,
        PermissionScope.FORUM_ADMIN,
        PermissionScope.USER_VIEW,
        PermissionScope.USER_EDIT,
        PermissionScope.USER_BAN,
        PermissionScope.ADMIN_ACCESS,
        PermissionScope.ADMIN_SETTINGS,
        PermissionScope.ECONOMY_VIEW,
        PermissionScope.ECONOMY_MANAGE,
        PermissionScope.CONTENT_CREATE,
        PermissionScope.CONTENT_EDIT,
        PermissionScope.CONTENT_DELETE,
        PermissionScope.CONTENT_MODERATE
      ];
      
    case 'moderator':
      return [
        PermissionScope.FORUM_READ,
        PermissionScope.FORUM_WRITE,
        PermissionScope.FORUM_MODERATE,
        PermissionScope.USER_VIEW,
        PermissionScope.CONTENT_CREATE,
        PermissionScope.CONTENT_EDIT,
        PermissionScope.CONTENT_MODERATE
      ];
      
    case 'user':
    default:
      return [
        PermissionScope.FORUM_READ,
        PermissionScope.FORUM_WRITE,
        PermissionScope.USER_VIEW,
        PermissionScope.CONTENT_CREATE
      ];
  }
}

/**
 * Middleware to require authentication
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    logger.warn('AUTH_REQUIRED', 'Unauthenticated request', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  next();
};

/**
 * Middleware to require a specific role
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!hasRole(req.user, requiredRole)) {
      logger.warn('INSUFFICIENT_ROLE', `User lacks required role: ${requiredRole}`, {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRole,
        path: req.path
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires ${requiredRole} role or higher`,
        code: 'INSUFFICIENT_ROLE'
      });
    }
    
    next();
  };
};

/**
 * Middleware to require specific permissions
 */
export const requirePermission = (...permissions: PermissionScope[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const hasAllPermissions = permissions.every(permission => 
      hasPermission(req.user, permission)
    );
    
    if (!hasAllPermissions) {
      logger.warn('INSUFFICIENT_PERMISSIONS', 'User lacks required permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermissions: permissions,
        path: req.path
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to perform this action',
        requiredPermissions: permissions,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

/**
 * Middleware to require any of the specified permissions
 */
export const requireAnyPermission = (...permissions: PermissionScope[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const hasAnyPermission = permissions.some(permission => 
      hasPermission(req.user, permission)
    );
    
    if (!hasAnyPermission) {
      logger.warn('INSUFFICIENT_PERMISSIONS', 'User lacks any required permission', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermissions: permissions,
        path: req.path
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to perform this action',
        requiredPermissions: permissions,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

/**
 * Check if user owns a resource
 */
export const requireOwnership = (
  getResourceOwnerId: (req: AuthenticatedRequest) => UserId | undefined
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const ownerId = getResourceOwnerId(req);
    
    if (!ownerId) {
      return res.status(404).json({
        error: 'Resource not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    
    // Admins can access any resource
    if (hasRole(req.user, 'admin')) {
      return next();
    }
    
    // Check ownership
    if (req.user.id !== ownerId) {
      logger.warn('OWNERSHIP_REQUIRED', 'User does not own resource', {
        userId: req.user.id,
        ownerId,
        path: req.path
      });
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this resource',
        code: 'OWNERSHIP_REQUIRED'
      });
    }
    
    next();
  };
};

/**
 * Rate limit based on user role
 */
export function getRateLimitForRole(role: UserRole): {
  windowMs: number;
  max: number;
} {
  switch (role) {
    case 'developer':
    case 'super-admin':
      return { windowMs: 60 * 1000, max: 1000 }; // 1000 per minute
      
    case 'admin':
      return { windowMs: 60 * 1000, max: 500 }; // 500 per minute
      
    case 'moderator':
      return { windowMs: 60 * 1000, max: 200 }; // 200 per minute
      
    case 'user':
    default:
      return { windowMs: 60 * 1000, max: 60 }; // 60 per minute
  }
}

/**
 * Get user's effective permissions
 */
export function getUserPermissions(user: User): PermissionScope[] {
  const rolePermissions = getRolePermissions(user.role);
  const customPermissions = (user.pluginData?.permissions as string[]) || [];
  
  // Combine and deduplicate
  const allPermissions = new Set([...rolePermissions, ...customPermissions]);
  
  return Array.from(allPermissions) as PermissionScope[];
}

/**
 * Permission check for specific forum operations
 */
export function canModerateInForum(user: User, forumId: string): boolean {
  // Global moderators can moderate anywhere
  if (hasPermission(user, PermissionScope.FORUM_MODERATE)) {
    return true;
  }
  
  // Check forum-specific moderation permissions
  const forumModPermission = `forum.moderate.${forumId}`;
  return user.pluginData?.permissions?.includes(forumModPermission) || false;
}