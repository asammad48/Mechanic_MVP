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
    const { name, phone, address, vehicle } = req.body;
    
    // Use transaction to ensure both customer and vehicle are created
    const result = await prisma.$transaction(async (prisma) => {
      const customer = await prisma.customer.create({
        data: { 
          name, 
          phone, 
          address, 
          branchId: req.user!.branchId! 
        },
      });

      let createdVehicle = null;
      if (vehicle && vehicle.regNo) {
        createdVehicle = await prisma.vehicle.create({
          data: {
            regNo: vehicle.regNo,
            make: vehicle.make,
            model: vehicle.model,
            year: parseInt(vehicle.year),
            color: vehicle.color,
            vin: vehicle.vin,
            mileage: vehicle.mileage ? parseInt(vehicle.mileage) : null,
            customerId: customer.id,
            branchId: req.user!.branchId!
          }
        });
      }

      return { customer, vehicle: createdVehicle };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating customer/vehicle:', error);
    res.status(500).json({ message: 'An unexpected error occurred.', error: error instanceof Error ? error.message : String(error) });
  }
};
