import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllBranches = async (req: Request, res: Response) => {
  try {
    // Only super admins can access all branches
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden. Super admin access required.' });
    }

    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' }
    });

    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getMyBranch = async (req: Request, res: Response) => {
  try {
    if (!req.user?.branchId) {
      return res.status(403).json({ message: 'Access denied. User is not assigned to any branch.' });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: req.user.branchId },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    res.json(branch);
  } catch (error) {
    console.error('Error fetching user branch:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
