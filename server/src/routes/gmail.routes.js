import express from 'express';
import { getAuthUrl, oauthCallback, sendEmail, pollEmails } from '../controllers/gmail.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { allow } from '../middleware/roleGuard.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();

// OAuth setup
router.get('/auth-url', getAuthUrl);
router.get('/oauth2/callback', oauthCallback);

// Email operations
router.post('/send', requireAuth, allow(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), sendEmail);
router.post('/poll', requireAuth, allow(ROLES.ADMIN), pollEmails);

export default router;