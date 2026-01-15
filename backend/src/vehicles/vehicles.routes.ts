import { Router } from 'express';
import { getVehicles, createVehicle } from './vehicles.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Receptionist', 'Manager', 'Owner/Admin']));

router.get('/', getVehicles);
router.post('/', createVehicle);

export default router;
