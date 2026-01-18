import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createBranchSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  code: z.string().trim().min(1, 'Code is required').toUpperCase(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateBranchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).toUpperCase().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const getAllBranches = async (req: Request, res: Response) => {
  try {
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

export const createBranch = async (req: Request, res: Response) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden. Super admin access required.' });
    }

    const validated = createBranchSchema.parse(req.body);

    const existing = await prisma.branch.findUnique({
      where: { code: validated.code }
    });

    if (existing) {
      return res.status(409).json({ message: `Branch code ${validated.code} already exists.` });
    }

    const branch = await prisma.branch.create({
      data: validated,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        isActive: true,
        createdAt: true,
      }
    });

    res.status(201).json(branch);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating branch:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden. Super admin access required.' });
    }

    const { id } = req.params;
    const validated = updateBranchSchema.parse(req.body);

    if (validated.code) {
      const existing = await prisma.branch.findFirst({
        where: { 
          code: validated.code,
          id: { not: id }
        }
      });

      if (existing) {
        return res.status(400).json({ message: `Branch code ${validated.code} already exists.` });
      }
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: validated,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        isActive: true,
        createdAt: true,
      }
    });

    res.json(branch);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating branch:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
