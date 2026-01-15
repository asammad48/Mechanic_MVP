import { Router } from 'express';
import { deletePartItem } from '../visits/visits.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Manager', 'Owner/Admin']));

router.delete('/:id', deletePartItem);

export default router;
