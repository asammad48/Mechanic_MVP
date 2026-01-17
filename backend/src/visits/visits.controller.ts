import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const visitSchema = z.object({
  vehicleId: z.string(),
  customerId: z.string(),
  complaint: z.string().min(1),
  priority: z.string().optional(),
  expectedDelivery: z.string().optional(),
  assignedMechanicId: z.string().optional(),
});

const updateVisitSchema = z.object({
  status: z.string().optional(),
  complaint: z.string().optional(),
  priority: z.string().optional(),
  expectedDelivery: z.string().optional(),
  assignedMechanicId: z.string().optional(),
  discountAmount: z.number().optional(),
  discountType: z.string().optional(),
  taxRate: z.number().optional(),
});

const laborItemSchema = z.object({
  title: z.string().min(1),
  hours: z.number(),
  rate: z.number(),
});

const partItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int(),
  unitPrice: z.number(),
});

const paymentSchema = z.object({
  paidAmount: z.number(),
  method: z.string().optional(),
});

// Helper function to recalculate visit totals
const recalculateTotals = async (visitId: string) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { laborItems: true, partItems: true, payments: true },
  });

  if (!visit) return;

  const subtotalLabor = visit.laborItems.reduce((acc: number, item: any) => acc + item.subtotal, 0);
  const subtotalParts = visit.partItems.reduce((acc: number, item: any) => acc + item.subtotal, 0);
  const subtotal = subtotalLabor + subtotalParts;

  let discountAmount = 0;
  if (visit.discountType === 'PERCENTAGE') {
    discountAmount = subtotal * (visit.discountAmount / 100);
  } else {
    discountAmount = visit.discountAmount;
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (visit.taxRate / 100);

  const grandTotal = taxableAmount + taxAmount;
  const paidAmount = visit.payments.reduce((acc: number, item: any) => acc + item.paidAmount, 0);
  const dueAmount = grandTotal - paidAmount;
  const paymentStatus = dueAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID';

  await prisma.visit.update({
    where: { id: visitId },
    data: {
      subtotalLabor,
      subtotalParts,
      taxAmount,
      discountAmount,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentStatus,
    },
  });
};

export const getVisits = async (req: Request, res: Response) => {
  const { dateFrom, dateTo, status, mechanicId, search } = req.query;

  const where: any = {};

  if (dateFrom) {
    where.createdAt = { gte: new Date(dateFrom as string) };
  }
  if (dateTo) {
    where.createdAt = { ...where.createdAt, lte: new Date(dateTo as string) };
  }
  if (status) {
    where.status = status as string;
  }
  if (mechanicId) {
    where.assignedMechanicId = mechanicId as string;
  }
  if (search) {
    where.OR = [
      { vehicle: { regNo: { contains: search as string, mode: 'insensitive' } } },
      { customer: { name: { contains: search as string, mode: 'insensitive' } } },
      { customer: { phone: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  const visits = await prisma.visit.findMany({
    where,
    include: {
      vehicle: true,
      customer: true,
      assignedMechanic: true,
    },
  });
  res.json(visits);
};

export const getVisitById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      vehicle: true,
      customer: true,
      assignedMechanic: true,
      laborItems: true,
      partItems: true,
      payments: true,
      notes: true,
    },
  });
  if (!visit) {
    return res.status(404).json({ message: 'Visit not found.' });
  }
  res.json(visit);
};

export const createVisit = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    // Map snake_case from frontend to camelCase for backend validation
    const mappedData = {
      vehicleId: body.vehicle_id || body.vehicleId,
      customerId: body.customer_id || body.customerId,
      complaint: body.complaint,
      priority: body.priority,
      expectedDelivery: body.expected_delivery || body.expectedDelivery,
      assignedMechanicId: body.assigned_mechanic_id || body.assignedMechanicId
    };

    const { vehicleId, customerId, complaint, priority, expectedDelivery, assignedMechanicId } = visitSchema.parse(mappedData);
    
    const branch = await prisma.branch.findFirst();
    const branchId = req.user?.branchId || branch?.id;

    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is missing.' });
    }

    const visit = await prisma.visit.create({
      data: {
        vehicleId,
        customerId,
        branchId: branchId,
        complaint,
        priority,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        assignedMechanicId,
        createdByUserId: req.user!.id,
      },
    });
    res.status(201).json(visit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    console.error('Error creating visit:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const updateVisit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, complaint, priority, expectedDelivery, assignedMechanicId, discountAmount, discountType, taxRate } = updateVisitSchema.parse(req.body);

    if (req.user?.role === 'Mechanic') {
      if (discountAmount || discountType || taxRate) {
        return res.status(403).json({ message: 'Mechanics are not authorized to update pricing information.' });
      }
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        status,
        complaint,
        priority,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        assignedMechanicId,
        discountAmount,
        discountType,
        taxRate,
      },
    });
    await recalculateTotals(id);
    res.json(visit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const addLaborItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, hours, rate } = laborItemSchema.parse(req.body);
    const subtotal = hours * rate;
    const laborItem = await prisma.laborItem.create({
      data: {
        visitId: id,
        title,
        hours,
        rate,
        subtotal,
      },
    });
    await recalculateTotals(id);
    res.status(201).json(laborItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const deleteLaborItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const laborItem = await prisma.laborItem.findUnique({
    where: { id },
  });
  if (!laborItem) {
    return res.status(404).json({ message: 'Labor item not found.' });
  }
  await prisma.laborItem.delete({
    where: { id },
  });
  await recalculateTotals(laborItem.visitId);
  res.status(204).send();
};

export const addPartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, qty, unitPrice } = partItemSchema.parse(req.body);
    const subtotal = qty * unitPrice;
    const partItem = await prisma.partItem.create({
      data: {
        visitId: id,
        name,
        qty,
        unitPrice,
        subtotal,
      },
    });
    await recalculateTotals(id);
    res.status(201).json(partItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const deletePartItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const partItem = await prisma.partItem.findUnique({
    where: { id },
  });
  if (!partItem) {
    return res.status(404).json({ message: 'Part item not found.' });
  }
  await prisma.partItem.delete({
    where: { id },
  });
  await recalculateTotals(partItem.visitId);
  res.status(204).send();
};

export const addPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paidAmount, method } = paymentSchema.parse(req.body);
    const payment = await prisma.payment.create({
      data: {
        visitId: id,
        paidAmount,
        method,
      },
    });
    await recalculateTotals(id);
    res.status(201).json(payment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};
