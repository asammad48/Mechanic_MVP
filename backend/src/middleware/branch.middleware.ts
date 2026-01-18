import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce branch scoping rules.
 * 
 * - SuperAdmins: Access all branches. Can optionally provide branchId in query/body.
 * - Non-SuperAdmins: Restricted to their assigned branchId.
 * - If no branchId is assigned to a non-superadmin, access is forbidden.
 */
export const branchScoping = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Super admins can access everything. They might provide a branchId to filter.
  if (req.user.isSuperAdmin) {
    return next();
  }

  // Non-super admins must have a branch assigned.
  if (!req.user.branchId) {
    return res.status(403).json({ 
      message: 'Access denied. User is not assigned to any branch.' 
    });
  }

  // Force the branchId from the user's session, ignoring any client-provided branchId.
  // We don't overwrite the body/query directly here but provide a helper for controllers.
  next();
};

/**
 * Helper to get the effective branchId for database queries.
 * @param req Express Request object
 * @returns The branchId to filter by, or null if all branches are accessible (SuperAdmin)
 */
export const getEffectiveBranchId = (req: Request): string | null => {
  if (!req.user) return null;
  
  if (req.user.isSuperAdmin) {
    // SuperAdmins can optionally filter by branchId from query or body if they want
    const providedId = (req.query.branchId || req.body.branchId) as string;
    return providedId || null;
  }

  return req.user.branchId;
};

/**
 * Helper to apply branch scoping to a Prisma 'where' object.
 * @param req Express Request object
 * @param where The existing where clause
 * @returns The updated where clause with branch scoping applied
 */
export function applyBranchWhere<T extends { branchId?: any }>(req: Request, where: T): T & { branchId: string } | T {
  const branchId = getEffectiveBranchId(req);
  
  if (!branchId) {
    return where;
  }

  return {
    ...where,
    branchId
  };
}
