import { Router } from 'express';
import { getCustomers, createCustomer } from './customers.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Receptionist', 'Manager', 'Owner/Admin']));

router.get('/', getCustomers);
router.post('/', createCustomer);

export default router;
