import { Router } from 'express';
import { getCustomers, createCustomer } from './customers.controller';
import { authenticate, authorize } from '../auth/auth.middleware';
import { checkBranchActive } from '../middleware/branch-active.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Receptionist', 'Manager', 'Owner/Admin']));

router.get('/', getCustomers);
router.post('/', checkBranchActive, createCustomer);

export default router;
