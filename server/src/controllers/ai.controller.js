import { AIService } from '../services/ai.service.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { User } from '../models/User.js';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  context: z.object({}).optional()
});

const analyzeSchema = z.object({
  leaveIds: z.array(z.string()).optional(),
  employeeId: z.string().optional(),
  timeframe: z.number().int().min(1).max(365).default(90)
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI Chat Assistant for Leave Management
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 example: "What's the company policy for sick leave?"
 *               context:
 *                 type: object
 *                 description: Additional context for the AI
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 helpful:
 *                   type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export const aiChat = async (req, res, next) => {
  try {
    const { message, context } = chatSchema.parse(req.body);
    
    // Get user's recent leave context for more helpful responses
    const userContext = {
      role: req.user.role,
      userId: req.user.userId,
      ...context
    };

    // Add recent leave data to context if helpful
    if (message.toLowerCase().includes('my leave') || message.toLowerCase().includes('status')) {
      const recentLeaves = await LeaveRequest.find({ 
        employeeId: req.user.userId 
      })
      .limit(3)
      .sort({ createdAt: -1 })
      .select('type status startDate endDate');
      
      userContext.recentLeaves = recentLeaves;
    }

    const aiResponse = await AIService.chatAssistant(message, req.user.role, userContext);
    res.json(aiResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/ai/analyze-patterns:
 *   post:
 *     summary: AI Pattern Analysis for Leave Prediction (Manager/Admin only)
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Specific employee to analyze (if not provided, analyzes requester)
 *               timeframe:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 default: 90
 *                 description: Days of history to analyze
 *     responses:
 *       200:
 *         description: AI pattern analysis
 */
export const analyzePatterns = async (req, res, next) => {
  try {
    const { employeeId, timeframe } = analyzeSchema.parse(req.body);
    
    // Determine which employee to analyze
    let targetEmployeeId = req.user.userId;
    
    if (employeeId) {
      // Only managers and admins can analyze other employees
      if (req.user.role === 'EMPLOYEE') {
        return res.status(403).json({ error: 'Employees can only analyze their own patterns' });
      }
      
      // If manager, ensure they can only analyze their team
      if (req.user.role === 'MANAGER') {
        const employee = await User.findById(employeeId);
        if (!employee || employee.managerId.toString() !== req.user.userId) {
          return res.status(403).json({ error: 'You can only analyze your team members' });
        }
      }
      
      targetEmployeeId = employeeId;
    }

    const patterns = await AIService.predictLeavePatterns(targetEmployeeId, timeframe);
    
    res.json({
      employeeId: targetEmployeeId,
      timeframe,
      analysis: patterns,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/ai/insights:
 *   get:
 *     summary: Get AI insights for pending leave requests (Manager/Admin only)
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: AI insights for pending leaves
 */
export const getAIInsights = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get pending leaves based on user role
    let query = { status: 'PENDING' };
    if (req.user.role === 'MANAGER') {
      query.managerId = req.user.userId;
    }
    
    const pendingLeaves = await LeaveRequest.find(query)
      .populate('employeeId', 'name email role')
      .populate('managerId', 'name email')
      .sort({ 'aiAnalysis.urgency': -1, createdAt: 1 })
      .limit(limit);

    const insights = pendingLeaves.map(leave => ({
      leaveId: leave._id,
      employee: leave.employeeId.name,
      type: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      aiAnalysis: leave.aiAnalysis,
      managerRecommendation: leave.managerAIRecommendation,
      daysAgo: Math.floor((new Date() - leave.createdAt) / (1000 * 60 * 60 * 24)),
      requiresAttention: leave.aiAnalysis?.urgency >= 4 || 
                        (new Date() - leave.createdAt) > (7 * 24 * 60 * 60 * 1000)
    }));

    // Sort by priority: high urgency and older requests first
    insights.sort((a, b) => {
      if (a.requiresAttention !== b.requiresAttention) {
        return b.requiresAttention - a.requiresAttention;
      }
      return (b.aiAnalysis?.urgency || 0) - (a.aiAnalysis?.urgency || 0);
    });

    res.json({
      totalPending: pendingLeaves.length,
      highPriority: insights.filter(i => i.requiresAttention).length,
      insights,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};