import { LeaveService } from '../services/leave.service.js';
import { z } from 'zod';
import { LEAVE_TYPES } from '../utils/roles.js';
import { jwtVerify } from 'jose';
import { env } from '../config/env.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

const createLeaveSchema = z.object({
  type: z.enum(Object.values(LEAVE_TYPES)),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(10)
});

const decisionSchema = z.object({
  comment: z.string().optional()
});

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Create a new leave request (EMPLOYEE only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLeaveDto'
 *     responses:
 *       201:
 *         description: Leave request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaveRequest'
 */
export const createLeave = async (req, res, next) => {
  try {
    const leaveData = createLeaveSchema.parse(req.body);
    const leave = await LeaveService.createLeave(req.user.userId, leaveData);
    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/leaves/mine:
 *   get:
 *     summary: Get my leave requests
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - EMPLOYEE: returns their own leave requests
 *       - MANAGER: returns leave requests assigned to them
 *       - ADMIN: returns all leave requests
 *     responses:
 *       200:
 *         description: List of leave requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaveRequest'
 */
export const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveService.getMyLeaves(req.user.userId, req.user.role);
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   post:
 *     summary: Approve a leave request (MANAGER only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecisionDto'
 *     responses:
 *       200:
 *         description: Leave approved
 *   get:
 *     summary: Quick approve via email link
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: actor
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave approved via email
 */
export const approveLeave = async (req, res, next) => {
  try {
    let managerId, comment = '';

    if (req.method === 'GET') {
      // Email link approval
      const { actor, token } = req.query;
      if (!actor || !token) {
        return res.status(400).json({ error: 'Missing actor or token' });
      }

      try {
        const { payload } = await jwtVerify(token, secret);
        if (payload.leaveId !== req.params.id || payload.managerId !== actor) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        managerId = actor;
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } else {
      // API approval
      managerId = req.user.userId;
      const data = decisionSchema.parse(req.body);
      comment = data.comment || '';
    }

    const leave = await LeaveService.approveLeave(req.params.id, managerId, comment);
    
    if (req.method === 'GET') {
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #28a745;">✓ Leave Request Approved</h2>
            <p>The leave request has been successfully approved.</p>
            <p style="color: #666; font-size: 14px;">Leave ID: ${req.params.id}</p>
          </body>
        </html>
      `);
    } else {
      res.json(leave);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   post:
 *     summary: Reject a leave request (MANAGER only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecisionDto'
 *     responses:
 *       200:
 *         description: Leave rejected
 *   get:
 *     summary: Quick reject via email link
 *     tags: [Leaves]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: actor
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave rejected via email
 */
export const rejectLeave = async (req, res, next) => {
  try {
    let managerId, comment = '';

    if (req.method === 'GET') {
      // Email link rejection
      const { actor, token } = req.query;
      if (!actor || !token) {
        return res.status(400).json({ error: 'Missing actor or token' });
      }

      try {
        const { payload } = await jwtVerify(token, secret);
        if (payload.leaveId !== req.params.id || payload.managerId !== actor) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        managerId = actor;
      } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } else {
      // API rejection
      managerId = req.user.userId;
      const data = decisionSchema.parse(req.body);
      comment = data.comment || '';
    }

    const leave = await LeaveService.rejectLeave(req.params.id, managerId, comment);
    
    if (req.method === 'GET') {
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc3545;">✗ Leave Request Rejected</h2>
            <p>The leave request has been rejected.</p>
            <p style="color: #666; font-size: 14px;">Leave ID: ${req.params.id}</p>
          </body>
        </html>
      `);
    } else {
      res.json(leave);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/leaves/{id}/cancel:
 *   post:
 *     summary: Cancel a leave request (EMPLOYEE only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave cancelled
 */
export const cancelLeave = async (req, res, next) => {
  try {
    const leave = await LeaveService.cancelLeave(req.params.id, req.user.userId);
    res.json(leave);
  } catch (error) {
    next(error);
  }
};