import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const userQuerySchema = z.object({
  search: z.string().optional(),
  branchId: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
});

const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().min(1, 'Role ID is required'),
  branchId: z.string().nullable().optional(),
  isSuperAdmin: z.boolean().optional().default(false),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  roleId: z.string().optional(),
  branchId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const query = userQuerySchema.parse(req.query);
    // Logic for filtering will be implemented in next task, for now just returning all
    const users = await prisma.user.findMany({
      include: { role: true, branch: true },
    });
    // Remove sensitive data
    const safeUsers = users.map(({ password_hash, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid query parameters.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const validated = createUserSchema.parse(req.body);
    const password_hash = await bcrypt.hash(validated.password, 10);
    
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password_hash,
        roleId: validated.roleId,
        branchId: validated.branchId,
        isSuperAdmin: validated.isSuperAdmin,
      },
      include: { role: true, branch: true },
    });
    
    const { password_hash: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    console.error('Create user error:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
};

export const getBranches = async (req: Request, res: Response) => {
  const branches = await prisma.branch.findMany({
    where: { isActive: true }
  });
  res.json(branches);
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const validated = updateUserSchema.parse(req.body);
    const { id } = req.params;
    
    // Placeholder implementation for next task
    res.json({ message: 'updateUser logic not fully implemented yet', data: validated, userId: id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);
    const { id } = req.params;

    // Placeholder implementation for next task
    res.json({ message: 'resetPassword logic not fully implemented yet', userId: id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};
