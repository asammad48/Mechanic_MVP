import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import config from '../lib/config';

const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    console.log(`Login attempt for email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      console.log(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { role: true },
  });

  if (!user || !user.role) {
    return res.status(404).json({ message: 'User not found or role missing.' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
  });
};
