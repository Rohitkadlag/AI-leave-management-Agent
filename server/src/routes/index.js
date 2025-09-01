import express from 'express';
import authRoutes from './auth.routes.js';
import leaveRoutes from './leave.routes.js';
import gmailRoutes from './gmail.routes.js';
import aiRoutes from './ai.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/leaves', leaveRoutes);
router.use('/gmail', gmailRoutes);
router.use('/ai', aiRoutes); // 🤖 AI Routes

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'leavemgmt-api',
    aiEnabled: !!process.env.DEEPSEEK_API_KEY
  });
});

export default router;