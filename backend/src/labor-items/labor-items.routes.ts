import { Router } from 'express';
import { deleteLaborItem } from '../visits/visits.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Mechanic', 'Manager', 'Owner/Admin']));

router.delete('/:id', deleteLaborItem);

export default router;
