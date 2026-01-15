import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const vehicleSchema = z.object({
  reg_no: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int(),
  color: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.number().int().optional(),
  customer_id: z.number().int(),
});

export const getVehicles = async (req: Request, res: Response) => {
  const { search } = req.query;
  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { reg_no: { contains: search as string, mode: 'insensitive' } },
        { vin: { contains: search as string, mode: 'insensitive' } },
      ],
    },
    include: { customer: true },
  });
  res.json(vehicles);
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { reg_no, make, model, year, color, vin, mileage, customer_id } = vehicleSchema.parse(req.body);
    const vehicle = await prisma.vehicle.create({
      data: { reg_no, make, model, year, color, vin, mileage, customer_id },
      include: { customer: true },
    });
    res.status(201).json(vehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};
