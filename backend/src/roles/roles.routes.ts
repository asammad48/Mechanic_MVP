import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import * as rolesController from './roles.controller';

const router = Router();

router.use(authenticate);

router.get('/', rolesController.getRoles);
router.post('/', rolesController.createRole);
router.patch('/:id', rolesController.updateRole);

export default router;
