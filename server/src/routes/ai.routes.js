import express from 'express';
import { aiChat, analyzePatterns, getAIInsights } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { allow } from '../middleware/roleGuard.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();

// AI Chat Assistant - Available to all authenticated users
router.post('/chat', requireAuth, allow(ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN), aiChat);

// AI Pattern Analysis - Employees can analyze themselves, Managers/Admins can analyze others
router.post('/analyze-patterns', requireAuth, allow(ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN), analyzePatterns);

// AI Insights Dashboard - Manager and Admin only
router.get('/insights', requireAuth, allow(ROLES.MANAGER, ROLES.ADMIN), getAIInsights);

export default router;