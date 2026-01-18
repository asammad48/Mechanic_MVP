import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { getEffectiveBranchId } from '../middleware/branch.middleware';

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
  roleId: z.string().optional(),
  role: z.string().optional(),
  branchId: z.string().nullable().optional(),
  isSuperAdmin: z.boolean().optional().default(false),
}).refine(data => data.roleId || data.role, {
  message: "Either roleId or role name must be provided",
  path: ["roleId"]
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  roleId: z.string().optional(),
  role: z.string().optional(),
  branchId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const query = userQuerySchema.parse(req.query);
    const effectiveBranchId = getEffectiveBranchId(req);

    const where: any = {};

    if (effectiveBranchId) {
      where.branchId = effectiveBranchId;
    } else if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: { role: true, branch: true },
      orderBy: { createdAt: 'desc' }
    });

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
    
    // RBAC: Non-super admin cannot create super admin
    if (!req.user?.isSuperAdmin && validated.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super admins can create other super admins.' });
    }

    // Resolve roleId if not provided but role name is
    let roleId = validated.roleId;
    if (!roleId && validated.role) {
      const role = await prisma.role.findUnique({
        where: { name: validated.role }
      });
      if (!role) {
        return res.status(400).json({ message: `Role '${validated.role}' not found.` });
      }
      roleId = role.id;
    }

    if (!roleId) {
      return res.status(400).json({ message: 'Role ID or role name is required.' });
    }

    // Branch Scoping: Non-super admin must create in their branch
    const branchId = req.user?.isSuperAdmin ? validated.branchId : req.user?.branchId;
    
    if (!req.user?.isSuperAdmin && validated.branchId && validated.branchId !== req.user?.branchId) {
      return res.status(403).json({ message: 'Cannot create user in another branch.' });
    }

    const password_hash = await bcrypt.hash(validated.password, 10);
    
    const existing = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password_hash,
        roleId: roleId,
        branchId: branchId || null,
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const validated = updateUserSchema.parse(req.body);
    const { id } = req.params;
    
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // RBAC: Non-super cannot modify super
    if (!req.user?.isSuperAdmin && targetUser.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot modify super admin users.' });
    }

    // Branch Scoping: Non-super cannot modify across branches
    if (!req.user?.isSuperAdmin && targetUser.branchId !== req.user?.branchId) {
      return res.status(403).json({ message: 'Cannot modify users in other branches.' });
    }

    // Self-Protection: Block deactivating yourself
    if (id === req.user?.id && validated.isActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }

    // Self-Protection: Block changing own role unless super admin
    if (id === req.user?.id && validated.roleId && !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'You cannot change your own role.' });
    }

    // Branch Scoping: Non-super cannot change branchId
    if (!req.user?.isSuperAdmin && validated.branchId && validated.branchId !== req.user?.branchId) {
      return res.status(403).json({ message: 'You cannot move users to another branch.' });
    }

    const { role, ...updateData } = validated;
    const data: any = { ...updateData };
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: { role: true, branch: true }
    });

    const { password_hash: _, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    console.error('Update user error:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);
    const { id } = req.params;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // RBAC & Branch Scoping same as update
    if (!req.user?.isSuperAdmin && targetUser.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot reset password for super admin users.' });
    }
    if (!req.user?.isSuperAdmin && targetUser.branchId !== req.user?.branchId) {
      return res.status(403).json({ message: 'Cannot reset password for users in other branches.' });
    }

    const password_hash = await bcrypt.hash(validated.newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password_hash }
    });

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    console.error('Reset password error:', error);
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
