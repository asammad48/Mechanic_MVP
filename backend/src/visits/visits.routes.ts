import { Router } from 'express';
import { 
  getVisits, 
  getVisitById, 
  createVisit, 
  updateVisit, 
  addLaborItem, 
  deleteLaborItem,
  addPartItem, 
  deletePartItem,
  addOutsideWorkItem,
  deleteOutsideWorkItem,
  addPayment,
  exportVisits
} from './visits.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Protect all routes in this file
router.use(authenticate);

router.get('/', authorize(['Receptionist', 'Manager', 'Owner/Admin', 'Mechanic']), getVisits);
router.get('/export', authorize(['Manager', 'Owner/Admin']), exportVisits);
router.get('/:id', authorize(['Receptionist', 'Manager', 'Owner/Admin', 'Mechanic']), getVisitById);
router.post('/', authorize(['Receptionist', 'Manager', 'Owner/Admin']), createVisit);
router.patch('/:id', authorize(['Manager', 'Owner/Admin', 'Mechanic']), updateVisit);
router.post('/:id/labor-items', authorize(['Mechanic', 'Manager', 'Owner/Admin']), addLaborItem);
router.post('/:id/part-items', authorize(['Manager', 'Owner/Admin']), addPartItem);
router.post('/:id/outside-work-items', authorize(['Manager', 'Owner/Admin']), addOutsideWorkItem);
router.post('/:id/payments', authorize(['Receptionist', 'Manager', 'Owner/Admin']), addPayment);

export default router;
