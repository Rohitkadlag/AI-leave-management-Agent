import express from 'express';
import { 
  createLeave, 
  getMyLeaves, 
  approveLeave, 
  rejectLeave, 
  cancelLeave 
} from '../controllers/leave.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { allow } from '../middleware/roleGuard.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();

// Employee routes
router.post('/', requireAuth, allow(ROLES.EMPLOYEE), createLeave);
router.post('/:id/cancel', requireAuth, allow(ROLES.EMPLOYEE), cancelLeave);

// Manager/Admin routes
router.post('/:id/approve', requireAuth, allow(ROLES.MANAGER, ROLES.ADMIN), approveLeave);
router.post('/:id/reject', requireAuth, allow(ROLES.MANAGER, ROLES.ADMIN), rejectLeave);

// Email link routes (no auth required, token-based)
router.get('/:id/approve', approveLeave);
router.get('/:id/reject', rejectLeave);

// Universal routes (role-based filtering)
router.get('/mine', requireAuth, allow(ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN), getMyLeaves);

export default router;