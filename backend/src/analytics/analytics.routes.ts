import { Router } from 'express';
import { getSummary, getRange } from './analytics.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Manager', 'Owner/Admin']));

router.get('/summary', getSummary);
router.get('/range', getRange);

export default router;
