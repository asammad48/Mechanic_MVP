import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const visitSchema = z.object({
  vehicle_id: z.number().int(),
  customer_id: z.number().int(),
  complaint: z.string().min(1),
  priority: z.string().optional(),
  expected_delivery: z.string().optional(),
  assigned_mechanic_id: z.number().int().optional(),
});

const updateVisitSchema = z.object({
  status: z.string().optional(),
  complaint: z.string().optional(),
  priority: z.string().optional(),
  expected_delivery: z.string().optional(),
  assigned_mechanic_id: z.number().int().optional(),
  discount_amount: z.number().optional(),
  discount_type: z.string().optional(),
  tax_rate: z.number().optional(),
});

const laborItemSchema = z.object({
  title: z.string().min(1),
  hours: z.number(),
  rate: z.number(),
});

const partItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int(),
  unit_price: z.number(),
});

const paymentSchema = z.object({
  paid_amount: z.number(),
  method: z.string().optional(),
});

// Helper function to recalculate visit totals
const recalculateTotals = async (visitId: number) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { labor_items: true, part_items: true, payments: true },
  });

  if (!visit) return;

  const subtotal_labor = visit.labor_items.reduce((acc, item) => acc + item.subtotal, 0);
  const subtotal_parts = visit.part_items.reduce((acc, item) => acc + item.subtotal, 0);
  const subtotal = subtotal_labor + subtotal_parts;

  let discount_amount = 0;
  if (visit.discount_type === 'PERCENTAGE') {
    discount_amount = subtotal * (visit.discount_amount / 100);
  } else {
    discount_amount = visit.discount_amount;
  }

  const taxable_amount = subtotal - discount_amount;
  const tax_amount = taxable_amount * (visit.tax_rate / 100);

  const grand_total = taxable_amount + tax_amount;
  const paid_amount = visit.payments.reduce((acc, item) => acc + item.paid_amount, 0);
  const due_amount = grand_total - paid_amount;
  const payment_status = due_amount <= 0 ? 'PAID' : paid_amount > 0 ? 'PARTIAL' : 'UNPAID';

  await prisma.visit.update({
    where: { id: visitId },
    data: {
      subtotal_labor,
      subtotal_parts,
      tax_amount,
      discount_amount,
      grand_total,
      paid_amount,
      due_amount,
      payment_status,
    },
  });
};

export const getVisits = async (req: Request, res: Response) => {
  const { dateFrom, dateTo, status, mechanicId, search } = req.query;

  const where: any = {};

  if (dateFrom) {
    where.created_at = { gte: new Date(dateFrom as string) };
  }
  if (dateTo) {
    where.created_at = { ...where.created_at, lte: new Date(dateTo as string) };
  }
  if (status) {
    where.status = status as string;
  }
  if (mechanicId) {
    where.assigned_mechanic_id = parseInt(mechanicId as string);
  }
  if (search) {
    where.OR = [
      { vehicle: { reg_no: { contains: search as string, mode: 'insensitive' } } },
      { customer: { name: { contains: search as string, mode: 'insensitive' } } },
      { customer: { phone: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  const visits = await prisma.visit.findMany({
    where,
    include: {
      vehicle: true,
      customer: true,
      assigned_mechanic: true,
    },
  });
  res.json(visits);
};

export const getVisitById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const visit = await prisma.visit.findUnique({
    where: { id: parseInt(id) },
    include: {
      vehicle: true,
      customer: true,
      assigned_mechanic: true,
      labor_items: true,
      part_items: true,
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
    const { vehicle_id, customer_id, complaint, priority, expected_delivery, assigned_mechanic_id } = visitSchema.parse(req.body);
    const visit = await prisma.visit.create({
      data: {
        vehicle_id,
        customer_id,
        complaint,
        priority,
        expected_delivery: expected_delivery ? new Date(expected_delivery) : null,
        assigned_mechanic_id,
        created_by_user_id: req.user!.id,
      },
    });
    res.status(201).json(visit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const updateVisit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, complaint, priority, expected_delivery, assigned_mechanic_id, discount_amount, discount_type, tax_rate } = updateVisitSchema.parse(req.body);

    if (req.user?.role === 'Mechanic') {
      if (discount_amount || discount_type || tax_rate) {
        return res.status(403).json({ message: 'Mechanics are not authorized to update pricing information.' });
      }
    }

    const visit = await prisma.visit.update({
      where: { id: parseInt(id) },
      data: {
        status,
        complaint,
        priority,
        expected_delivery: expected_delivery ? new Date(expected_delivery) : null,
        assigned_mechanic_id,
        discount_amount,
        discount_type,
        tax_rate,
      },
    });
    await recalculateTotals(parseInt(id));
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
        visit_id: parseInt(id),
        title,
        hours,
        rate,
        subtotal,
      },
    });
    await recalculateTotals(parseInt(id));
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
    where: { id: parseInt(id) },
  });
  if (!laborItem) {
    return res.status(404).json({ message: 'Labor item not found.' });
  }
  await prisma.laborItem.delete({
    where: { id: parseInt(id) },
  });
  await recalculateTotals(laborItem.visit_id);
  res.status(204).send();
};

export const addPartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, qty, unit_price } = partItemSchema.parse(req.body);
    const subtotal = qty * unit_price;
    const partItem = await prisma.partItem.create({
      data: {
        visit_id: parseInt(id),
        name,
        qty,
        unit_price,
        subtotal,
      },
    });
    await recalculateTotals(parseInt(id));
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
    where: { id: parseInt(id) },
  });
  if (!partItem) {
    return res.status(404).json({ message: 'Part item not found.' });
  }
  await prisma.partItem.delete({
    where: { id: parseInt(id) },
  });
  await recalculateTotals(partItem.visit_id);
  res.status(204).send();
};

export const addPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paid_amount, method } = paymentSchema.parse(req.body);
    const payment = await prisma.payment.create({
      data: {
        visit_id: parseInt(id),
        paid_amount,
        method,
      },
    });
    await recalculateTotals(parseInt(id));
    res.status(201).json(payment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};
