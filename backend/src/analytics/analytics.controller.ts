import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const querySchema = z.object({
  range: z.enum(['7d', '30d', '90d', '12m', 'week', 'month', 'year']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  branchId: z.string().optional(),
  allBranches: z.string().optional(),
});

const getBranchFilter = (req: any, branchId?: string, allBranches?: string) => {
  if (req.user?.isSuperAdmin || req.user?.role === 'Owner/Admin') {
    if (allBranches === 'true') return {};
    if (branchId) return { branchId };
    return {}; 
  }
  return { branchId: req.user?.branchId };
};

const getDateFilter = (range?: string, dateFrom?: string, dateTo?: string) => {
  let from = dateFrom ? new Date(dateFrom) : null;
  let to = dateTo ? new Date(dateTo) : new Date();

  if (range && !dateFrom) {
    from = new Date();
    if (range === '7d' || range === 'week') {
      from.setDate(from.getDate() - 7);
    } else if (range === '30d' || range === 'month') {
      from.setDate(from.getDate() - 30);
    } else if (range === '90d') {
      from.setDate(from.getDate() - 90);
    } else if (range === '12m' || range === 'year') {
      from.setFullYear(from.getFullYear() - 1);
    }
    // Set to start of day for 'from'
    from.setHours(0, 0, 0, 0);
  }
  
  // Set to end of day for 'to'
  to.setHours(23, 59, 59, 999);
  
  if (from) {
    return { gte: from, lte: to };
  }
  return { lte: to };
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { range, dateFrom, dateTo, branchId, allBranches } = querySchema.parse(req.query);
    const branchFilter = getBranchFilter(req, branchId, allBranches);
    const dateFilter = getDateFilter(range, dateFrom, dateTo);

    const where: Prisma.VisitWhereInput = {
      ...branchFilter,
      createdAt: dateFilter,
    };

    const [totalVisits, deliveredVisits, statusCounts] = await Promise.all([
      prisma.visit.count({ where }),
      prisma.visit.findMany({
        where: branchFilter,
        select: { grandTotal: true, dueAmount: true, status: true, createdAt: true }
      }),
      prisma.visit.groupBy({
        by: ['status'],
        where,
        _count: { _all: true }
      })
    ]);

    // Filter delivered visits for revenue calculation within the date range
    const filteredDelivered = deliveredVisits.filter(v => 
      v.status === 'DELIVERED' && 
      (!dateFilter.gte || v.createdAt >= dateFilter.gte) && 
      v.createdAt <= dateFilter.lte
    );

    const totalRevenue = filteredDelivered.reduce((acc, v) => acc + Number(v.grandTotal), 0);
    const unpaidAmount = filteredDelivered.reduce((acc, v) => acc + Number(v.dueAmount), 0);
    const deliveredCount = filteredDelivered.length;
    const avgTicketSize = deliveredCount > 0 ? totalRevenue / deliveredCount : 0;
    
    const inProgressCount = (statusCounts as any[]).find(s => s.status === 'IN_PROGRESS')?._count?._all || 0;

    res.json({
      totalVisits,
      totalRevenue,
      unpaidAmount,
      avgTicketSize,
      deliveredCount,
      inProgressCount,
      statusBreakdown: (statusCounts as any[]).map(s => ({ status: s.status, count: s._count?._all || 0 }))
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ message: 'Error fetching summary' });
  }
};

export const getRevenueTrend = async (req: Request, res: Response) => {
  try {
    const { range, dateFrom, dateTo, branchId, allBranches } = querySchema.parse(req.query);
    const branchFilter = getBranchFilter(req, branchId, allBranches);
    const dateFilter = getDateFilter(range, dateFrom, dateTo);

    const visits = await prisma.visit.findMany({
      where: {
        ...branchFilter,
        createdAt: dateFilter,
        status: 'DELIVERED'
      },
      select: {
        createdAt: true,
        grandTotal: true,
        dueAmount: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    const trendMap = new Map();

    visits.forEach(v => {
      const date = v.createdAt.toISOString().split('T')[0];
      const month = v.createdAt.toISOString().slice(0, 7);
      const key = range === '12m' ? month : date;

      if (!trendMap.has(key)) {
        trendMap.set(key, { label: key, revenue: 0, visits: 0, unpaid: 0 });
      }
      const data = trendMap.get(key);
      data.revenue += Number(v.grandTotal);
      data.visits += 1;
      data.unpaid += Number(v.dueAmount);
    });

    // Fill in gaps if necessary or just return the sorted results
    const sortedTrend = Array.from(trendMap.values()).sort((a, b) => a.label.localeCompare(b.label));

    res.json(sortedTrend);
  } catch (error) {
    console.error('Revenue trend error:', error);
    res.status(500).json({ message: 'Error fetching revenue trend' });
  }
};

export const getStatusBreakdown = async (req: Request, res: Response) => {
  try {
    const { range, dateFrom, dateTo, branchId, allBranches } = querySchema.parse(req.query);
    const branchFilter = getBranchFilter(req, branchId, allBranches);
    const dateFilter = getDateFilter(range, dateFrom, dateTo);

    const statusCounts = await prisma.visit.groupBy({
      by: ['status'],
      where: {
        ...branchFilter,
        createdAt: dateFilter,
      },
      _count: { _all: true }
    });

    res.json((statusCounts as any[]).map(s => ({ status: s.status, count: s._count?._all || 0 })));
  } catch (error) {
    console.error('Status breakdown error:', error);
    res.status(500).json({ message: 'Error fetching status breakdown' });
  }
};

export const getTopMechanics = async (req: Request, res: Response) => {
  try {
    const { range, dateFrom, dateTo, branchId, allBranches } = querySchema.parse(req.query);
    const branchFilter = getBranchFilter(req, branchId, allBranches);
    const dateFilter = getDateFilter(range, dateFrom, dateTo);

    const visits = await prisma.visit.findMany({
      where: {
        ...branchFilter,
        createdAt: dateFilter,
        status: 'DELIVERED',
        assignedMechanicId: { not: null }
      },
      include: {
        assignedMechanic: {
          select: { name: true }
        }
      }
    });

    const mechMap = new Map();

    visits.forEach((v: any) => {
      const mechId = v.assignedMechanicId!;
      const mechName = v.assignedMechanic?.name || 'Unknown';

      if (!mechMap.has(mechId)) {
        mechMap.set(mechId, { mechanicId: mechId, mechanicName: mechName, deliveredCount: 0, revenue: 0 });
      }
      const data = mechMap.get(mechId);
      data.deliveredCount += 1;
      data.revenue += Number(v.grandTotal);
    });

    const result = Array.from(mechMap.values()).map(m => ({
      ...m,
      avgTicket: m.deliveredCount > 0 ? m.revenue / m.deliveredCount : 0
    })).sort((a, b) => b.revenue - a.revenue);

    res.json(result);
  } catch (error) {
    console.error('Top mechanics error:', error);
    res.status(500).json({ message: 'Error fetching top mechanics' });
  }
};
