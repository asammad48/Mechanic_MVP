import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const roleSchema = z.object({
  name: z.string().trim().min(1, 'Role name is required'),
});

const roleIdParamsSchema = z.object({
  id: z.string().min(1, 'Role ID is required'),
});

const CORE_ROLES = ['Owner/Admin', 'Manager', 'Mechanic', 'Receptionist'];

export const getRoles = async (req: Request, res: Response) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden. Super admin access required.' });
    }

    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden. Super admin access required.' });
    }

    const validated = roleSchema.parse(req.body);

    const existing = await prisma.role.findUnique({
      where: { name: validated.name },
    });

    if (existing) {
      return res.status(409).json({ message: `Role ${validated.name} already exists.` });
    }

    const role = await prisma.role.create({
      data: validated,
    });

    res.status(201).json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden. Super admin access required.' });
    }

    const { id } = roleIdParamsSchema.parse(req.params);
    const validated = roleSchema.parse(req.body);

    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    if (CORE_ROLES.includes(existingRole.name)) {
      return res.status(403).json({ message: 'Cannot rename core roles.' });
    }

    const duplicateName = await prisma.role.findFirst({
      where: {
        name: validated.name,
        id: { not: id },
      },
    });

    if (duplicateName) {
      return res.status(409).json({ message: `Role name ${validated.name} already exists.` });
    }

    const role = await prisma.role.update({
      where: { id },
      data: validated,
    });

    res.json(role);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
