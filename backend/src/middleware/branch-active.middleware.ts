import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { getEffectiveBranchId } from './branch.middleware';

/**
 * Middleware to block record creation if the branch is inactive.
 */
export const checkBranchActive = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const branchId = getEffectiveBranchId(req);

  if (!branchId) {
    // If even super admin didn't provide a branchId for a creation task, it's ambiguous
    return res.status(400).json({ message: 'Branch ID is required for this operation.' });
  }

  try {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { isActive: true }
    });

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    if (!branch.isActive) {
      return res.status(403).json({ 
        message: 'Branch is inactive. New records cannot be created.' 
      });
    }

    next();
  } catch (error) {
    console.error('Error in checkBranchActive middleware:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
