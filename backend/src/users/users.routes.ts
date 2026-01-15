import { Router } from 'express';
import { getUsers, createUser, getRoles } from './users.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate, authorize(['Owner/Admin']));

router.get('/', getUsers);
router.post('/', createUser);
router.get('/roles', getRoles);

export default router;
