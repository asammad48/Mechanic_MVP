import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import * as branchesController from './branches.controller';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /branches - Super Admin only
router.get('/', branchesController.getAllBranches);

// GET /branches/me - For non-super users
router.get('/me', branchesController.getMyBranch);

// POST /branches - Super Admin only
router.post('/', branchesController.createBranch);

// PATCH /branches/:id - Super Admin only
router.patch('/:id', branchesController.updateBranch);

export default router;
