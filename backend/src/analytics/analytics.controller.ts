import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const summarySchema = z.object({
  range: z.enum(['week', 'month', 'year']),
});

const rangeSchema = z.object({
  dateFrom: z.string().transform((str) => new Date(str)),
  dateTo: z.string().transform((str) => new Date(str)),
});

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { range } = summarySchema.parse(req.query);
    const now = new Date();
    let dateFrom: Date;

    if (range === 'week') {
      dateFrom = new Date(now.setDate(now.getDate() - 7));
    } else if (range === 'month') {
      dateFrom = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    const result = await getAnalyticsData(dateFrom, new Date());
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

export const getRange = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = rangeSchema.parse(req.query);
    const result = await getAnalyticsData(dateFrom, dateTo);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input.', details: error.issues });
    }
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

const getAnalyticsData = async (dateFrom: Date, dateTo: Date) => {
  const total_visits = await prisma.visit.count({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });

  const revenue = await prisma.visit.aggregate({
    _sum: {
      grandTotal: true,
    },
    where: {
      status: 'DELIVERED',
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });

  const unpaid = await prisma.visit.aggregate({
    _sum: {
      dueAmount: true,
    },
    where: {
      dueAmount: {
        gt: 0,
      },
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });

  return {
    total_visits,
    total_revenue: revenue._sum?.grandTotal || 0,
    unpaid_amount: unpaid._sum?.dueAmount || 0,
  };
};
