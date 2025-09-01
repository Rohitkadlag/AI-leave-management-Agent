import { GmailService } from '../services/gmail.service.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { z } from 'zod';
import { LEAVE_STATUS } from '../utils/roles.js';

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  threadId: z.string().optional()
});

const pollSchema = z.object({
  query: z.string().default(''),
  max: z.number().int().min(1).max(50).default(10)
});

/**
 * @swagger
 * /api/gmail/auth-url:
 *   get:
 *     summary: Get Gmail OAuth authorization URL
 *     tags: [Gmail]
 *     responses:
 *       200:
 *         description: OAuth URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 */
export const getAuthUrl = async (req, res, next) => {
  try {
    const authUrl = await GmailService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/gmail/oauth2/callback:
 *   get:
 *     summary: OAuth2 callback endpoint
 *     tags: [Gmail]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OAuth tokens stored successfully
 */
export const oauthCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // For simplicity, we'll use the first admin user found
    // In production, you might want to implement proper user association
    const { User } = await import('../models/User.js');
    const { ROLES } = await import('../utils/roles.js');
    const { env } = await import('../config/env.js');
    
    const admin = await User.findOne({ role: ROLES.ADMIN });
    if (!admin) {
      return res.status(404).json({ error: 'No admin user found' });
    }

    await GmailService.exchangeCodeStoreTokens({
      userId: admin._id,
      mailbox: env.SERVICE_MAILBOX,
      code
    });

    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #28a745;">✓ Gmail Connected Successfully</h2>
          <p>Gmail integration has been set up for the leave management system.</p>
          <p>You can now close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/gmail/send:
 *   post:
 *     summary: Send email via Gmail
 *     tags: [Gmail]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, subject, html]
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               html:
 *                 type: string
 *               threadId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 */
export const sendEmail = async (req, res, next) => {
  try {
    const emailData = sendEmailSchema.parse(req.body);
    const { env } = await import('../config/env.js');
    
    const result = await GmailService.sendHtml({
      userId: req.user.userId,
      mailbox: env.SERVICE_MAILBOX,
      ...emailData
    });

    res.json({ success: true, messageId: result.id });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/gmail/poll:
 *   post:
 *     summary: Poll Gmail for responses and process leave decisions (ADMIN only)
 *     tags: [Gmail]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 default: ""
 *               max:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 10
 *     responses:
 *       200:
 *         description: Polling completed
 */
export const pollEmails = async (req, res, next) => {
  try {
    const { query, max } = pollSchema.parse(req.body);
    
    // Use AI-enhanced email processing
    const { LeaveService } = await import('../services/leave.service.js');
    const result = await LeaveService.processIntelligentEmailPolling(
      req.user.userId,
      env.SERVICE_MAILBOX,
      query || 'subject:leave',
      max
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

