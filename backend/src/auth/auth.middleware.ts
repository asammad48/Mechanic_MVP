import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import config from '../lib/config';

interface JwtPayload {
  userId: string;
}

// Extend the Express Request interface is now done in types/express/index.d.ts

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication invalid.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId } = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Authentication invalid.' });
    }

    req.user = {
      id: user.id,
      role: user.role.name,
      roleId: user.roleId,
      branchId: user.branchId,
      isSuperAdmin: user.isSuperAdmin
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication invalid.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    next();
  };
};
