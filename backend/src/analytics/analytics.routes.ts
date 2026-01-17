import { Router } from 'express';
import { getSummary, getRevenueTrend, getStatusBreakdown, getTopMechanics } from './analytics.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Manager', 'Owner/Admin']));

router.get('/summary', getSummary);
router.get('/revenue-trend', getRevenueTrend);
router.get('/status-breakdown', getStatusBreakdown);
router.get('/top-mechanics', getTopMechanics);

export default router;
