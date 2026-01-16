import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().optional(),
});

export const getCustomers = async (req: Request, res: Response) => {
  const { search } = req.query;
  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ],
    },
  });
  res.json(customers);
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, address } = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: { name, phone, address, branchId: req.user!.branchId! },
    });
    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};
