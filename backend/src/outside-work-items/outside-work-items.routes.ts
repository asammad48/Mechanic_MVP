import { Router } from 'express';
import { deleteOutsideWorkItem } from '../visits/visits.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate, authorize(['Manager', 'Owner/Admin']));

router.delete('/:id', deleteOutsideWorkItem);

export default router;
