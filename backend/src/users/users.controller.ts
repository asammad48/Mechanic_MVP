import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string(),
  password: z.string().min(6),
  roleId: z.string(),
});

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleId } = userSchema.parse(req.body);
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash, roleId },
      include: { role: true },
    });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
};
