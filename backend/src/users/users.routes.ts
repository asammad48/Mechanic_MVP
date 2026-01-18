import { Router } from 'express';
import { getUsers, createUser, getRoles, getBranches, updateUser, resetPassword } from './users.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate);

router.get('/', authorize(['Owner/Admin']), getUsers);
router.post('/', authorize(['Owner/Admin']), createUser);
router.get('/roles', authorize(['Owner/Admin']), getRoles);
router.get('/branches', authorize(['Owner/Admin']), getBranches);
router.patch('/:id', authorize(['Owner/Admin']), updateUser);
router.post('/:id/reset-password', authorize(['Owner/Admin']), resetPassword);

export default router;
