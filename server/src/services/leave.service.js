import { LeaveRequest } from '../models/LeaveRequest.js';
import { User } from '../models/User.js';
import { GmailService } from './gmail.service.js';
import { AIService } from './ai.service.js';
import { approvalRequestTemplate, decisionTemplate } from './mail.templates.js';
import { LEAVE_STATUS, ROLES } from '../utils/roles.js';
import { isDateInPast, parseDate } from '../utils/date.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class LeaveService {
  static async createLeave(employeeId, leaveData) {
    const { type, startDate, endDate, reason } = leaveData;
    
    // Get employee details
    const employee = await User.findById(employeeId).populate('managerId');
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    if (!employee.managerId) {
      throw new Error('Employee has no assigned manager');
    }

    // Validate dates
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (isDateInPast(start)) {
      throw new Error('Start date cannot be in the past');
    }
    
    if (start > end) {
      throw new Error('End date must be after start date');
    }

    // Get team data for AI analysis
    const teamMembers = await User.find({ managerId: employee.managerId._id });

    // 🤖 AI ANALYSIS - Analyze leave request with DeepSeek
    logger.info('Starting AI analysis for leave request');
    const aiAnalysis = await AIService.analyzeLeaveRequest(
      { type, startDate: start, endDate: end, reason },
      employee,
      teamMembers
    );

    // Create leave request with AI analysis
    const leave = new LeaveRequest({
      employeeId,
      managerId: employee.managerId._id,
      type,
      startDate: start,
      endDate: end,
      reason,
      status: LEAVE_STATUS.PENDING,
      aiAnalysis, // Store AI analysis
      timeline: [{
        action: 'CREATED',
        actorId: employeeId,
        timestamp: new Date()
      }]
    });

    await leave.save();
    logger.info('Leave request created with AI analysis', { 
      leaveId: leave._id, 
      urgency: aiAnalysis.urgency,
      category: aiAnalysis.category,
      recommendation: aiAnalysis.recommendation
    });
    
    // Send email notification to manager with AI insights
    await this.sendApprovalEmailWithAI(leave._id);
    
    return await LeaveRequest.findById(leave._id)
      .populate('employeeId', 'name email')
      .populate('managerId', 'name email');
  }

  static async sendApprovalEmailWithAI(leaveId) {
    try {
      const leave = await LeaveRequest.findById(leaveId)
        .populate('employeeId', 'name email')
        .populate('managerId', 'name email');
      
      if (!leave) {
        throw new Error('Leave request not found');
      }

      // Generate AI-powered approval recommendation for manager
      const teamMembers = await User.find({ managerId: leave.managerId._id });
      const aiRecommendation = await AIService.generateApprovalRecommendation(
        leave,
        leave.managerId,
        leave.employeeId,
        teamMembers
      );

      // Store AI recommendation
      leave.managerAIRecommendation = {
        ...aiRecommendation,
        processedAt: new Date()
      };
      await leave.save();

      // Enhanced email template with AI insights
      const emailTemplate = await this.createAIEnhancedEmailTemplate(
        leave,
        leave.employeeId,
        leave.managerId,
        aiRecommendation
      );

      // Try to send Gmail
      const admin = await User.findOne({ role: ROLES.ADMIN });
      if (admin) {
        try {
          const result = await GmailService.sendHtml({
            userId: admin._id,
            mailbox: env.SERVICE_MAILBOX,
            to: leave.managerId.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html
          });

          leave.gmail = {
            threadId: result.threadId,
            requestMsgId: result.id
          };
          await leave.save();

          logger.info('AI-enhanced approval email sent', { leaveId, aiRecommendation: aiRecommendation.recommendation });
        } catch (error) {
          logger.warn('Gmail not configured or failed, email not sent:', error.message);
        }
      }
    } catch (error) {
      logger.error('Failed to send AI-enhanced approval email:', error);
    }
  }

  static async createAIEnhancedEmailTemplate(leave, employee, manager, aiRecommendation) {
    const { signJWT } = await import('../middleware/auth.js');
    const { formatDateRange } = await import('../utils/date.js');

    const token = await signJWT({ leaveId: leave._id, managerId: manager._id, purpose: 'leave_decision' });
    const dateRange = formatDateRange(leave.startDate, leave.endDate);
    
    const approveUrl = `${env.APP_BASE_URL}/api/leaves/${leave._id}/approve?actor=${manager._id}&token=${token}`;
    const rejectUrl = `${env.APP_BASE_URL}/api/leaves/${leave._id}/reject?actor=${manager._id}&token=${token}`;

    // AI insights for the email
    const urgencyColor = leave.aiAnalysis.urgency >= 4 ? '#dc3545' : leave.aiAnalysis.urgency >= 3 ? '#ffc107' : '#28a745';
    const recommendationColor = aiRecommendation.recommendation === 'approve' ? '#28a745' : 
                                aiRecommendation.recommendation === 'reject' ? '#dc3545' : '#6c757d';

    return {
      subject: `🤖 AI-Enhanced Leave Request - ${employee.name} (${leave.type}) - Urgency: ${leave.aiAnalysis.urgency}/5`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🤖 AI-Enhanced Leave Request</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
            <h3 style="margin-top: 0;">📊 AI Analysis</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Urgency:</strong> <span style="color: ${urgencyColor};">${leave.aiAnalysis.urgency}/5</span><br>
                <strong>Category:</strong> ${leave.aiAnalysis.category}<br>
                <strong>Sentiment:</strong> ${leave.aiAnalysis.sentiment}
              </div>
              <div>
                <strong>Risk Score:</strong> ${leave.aiAnalysis.riskScore}/5<br>
                <strong>AI Recommendation:</strong> <span style="color: ${recommendationColor};">${aiRecommendation.recommendation.toUpperCase()}</span><br>
                <strong>Confidence:</strong> ${aiRecommendation.confidence}%
              </div>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 4px;">
              <strong>AI Reasoning:</strong><br>
              <em>${aiRecommendation.reasoning}</em>
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📋 Request Details</h3>
            <p><strong>Employee:</strong> ${employee.name} (${employee.email})</p>
            <p><strong>Type:</strong> ${leave.type}</p>
            <p><strong>Dates:</strong> ${dateRange}</p>
            <p><strong>Reason:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
              ${leave.reason}
            </p>
          </div>

          ${aiRecommendation.conditions && aiRecommendation.conditions.length > 0 ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0;">⚠️ AI Suggested Conditions:</h4>
            <ul>
              ${aiRecommendation.conditions.map(condition => `<li>${condition}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${approveUrl}" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
              ✓ APPROVE
            </a>
            <a href="${rejectUrl}" 
               style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">
              ✗ REJECT
            </a>
          </div>

          <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
            <p>This analysis was powered by DeepSeek AI • ${env.MAIL_SENDER_NAME}</p>
            <p>Leave ID: ${leave._id}</p>
            <p>AI Analysis Confidence: ${leave.aiAnalysis.reasoning}</p>
          </div>
        </div>
      `
    };
  }

  static async processIntelligentEmailPolling(userId, mailbox, query, max = 10) {
    try {
      const messages = await GmailService.listMessages({
        userId,
        mailbox,
        query: query || 'subject:leave',
        max
      });

      const results = [];

      for (const message of messages || []) {
        try {
          const messageData = await GmailService.getMessage({
            userId,
            mailbox,
            messageId: message.id
          });

          // Extract subject and body
          const headers = messageData.payload?.headers || [];
          const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
          const subject = subjectHeader?.value || '';

          // Extract leave ID from subject
          const leaveIdMatch = subject.match(/leave.*?([a-f0-9]{24})/i);
          if (!leaveIdMatch) continue;

          const leaveId = leaveIdMatch[1];
          
          // Get message body
          let body = '';
          if (messageData.payload?.body?.data) {
            body = Buffer.from(messageData.payload.body.data, 'base64').toString();
          } else if (messageData.payload?.parts) {
            for (const part of messageData.payload.parts) {
              if (part.mimeType === 'text/plain' && part.body?.data) {
                body += Buffer.from(part.body.data, 'base64').toString();
              }
            }
          }

          // 🤖 AI-powered email processing
          const emailAnalysis = await AIService.processIntelligentEmail(body, leaveId);

          if (emailAnalysis.decision && emailAnalysis.confidence > 70) {
            const leave = await LeaveRequest.findById(leaveId);
            if (leave && leave.status === LEAVE_STATUS.PENDING) {
              leave.status = emailAnalysis.decision;
              leave.timeline.push({
                action: emailAnalysis.decision,
                actorId: leave.managerId,
                comment: `AI processed email: ${emailAnalysis.extractedInfo}`,
                timestamp: new Date()
              });
              await leave.save();

              results.push({
                messageId: message.id,
                leaveId,
                decision: emailAnalysis.decision,
                confidence: emailAnalysis.confidence,
                aiExtracted: emailAnalysis.extractedInfo,
                processed: true
              });

              logger.info('AI-processed email decision', { 
                leaveId, 
                decision: emailAnalysis.decision,
                confidence: emailAnalysis.confidence 
              });
            }
          }
        } catch (error) {
          results.push({
            messageId: message.id,
            error: error.message,
            processed: false
          });
        }
      }

      return {
        messagesChecked: messages?.length || 0,
        aiProcessed: results.filter(r => r.processed).length,
        results
      };
    } catch (error) {
      logger.error('Intelligent email polling failed:', error);
      throw error;
    }
  }

  // ... rest of the existing methods remain the same
  static async getMyLeaves(userId, userRole) {
    let query = {};
    
    if (userRole === ROLES.EMPLOYEE) {
      query.employeeId = userId;
    } else if (userRole === ROLES.MANAGER) {
      query.managerId = userId;
    }

    return await LeaveRequest.find(query)
      .populate('employeeId', 'name email')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });
  }

  static async approveLeave(leaveId, managerId, comment = '') {
    const leave = await LeaveRequest.findById(leaveId)
      .populate('employeeId', 'name email')
      .populate('managerId', 'name email');
    
    if (!leave) {
      throw new Error('Leave request not found');
    }
    
    if (leave.managerId._id.toString() !== managerId) {
      throw new Error('Not authorized to approve this leave');
    }
    
    if (leave.status !== LEAVE_STATUS.PENDING) {
      throw new Error('Leave request is not pending');
    }

    leave.status = LEAVE_STATUS.APPROVED;
    leave.timeline.push({
      action: 'APPROVED',
      actorId: managerId,
      comment,
      timestamp: new Date()
    });

    await leave.save();
    
    await this.sendDecisionEmail(leave, 'APPROVED', comment);
    
    return leave;
  }

  static async rejectLeave(leaveId, managerId, comment = '') {
    const leave = await LeaveRequest.findById(leaveId)
      .populate('employeeId', 'name email')
      .populate('managerId', 'name email');
    
    if (!leave) {
      throw new Error('Leave request not found');
    }
    
    if (leave.managerId._id.toString() !== managerId) {
      throw new Error('Not authorized to reject this leave');
    }
    
    if (leave.status !== LEAVE_STATUS.PENDING) {
      throw new Error('Leave request is not pending');
    }

    leave.status = LEAVE_STATUS.REJECTED;
    leave.timeline.push({
      action: 'REJECTED',
      actorId: managerId,
      comment,
      timestamp: new Date()
    });

    await leave.save();
    
    await this.sendDecisionEmail(leave, 'REJECTED', comment);
    
    return leave;
  }

  static async cancelLeave(leaveId, employeeId) {
    const leave = await LeaveRequest.findById(leaveId);
    
    if (!leave) {
      throw new Error('Leave request not found');
    }
    
    if (leave.employeeId.toString() !== employeeId) {
      throw new Error('Not authorized to cancel this leave');
    }
    
    if (leave.status !== LEAVE_STATUS.PENDING) {
      throw new Error('Can only cancel pending leave requests');
    }

    leave.status = LEAVE_STATUS.CANCELLED;
    leave.timeline.push({
      action: 'CANCELLED',
      actorId: employeeId,
      timestamp: new Date()
    });

    await leave.save();
    return leave;
  }

  static async sendDecisionEmail(leave, decision, comment = '') {
    try {
      const emailTemplate = decisionTemplate(
        leave,
        leave.employeeId,
        decision,
        comment
      );

      const admin = await User.findOne({ role: ROLES.ADMIN });
      if (admin) {
        try {
          const result = await GmailService.sendHtml({
            userId: admin._id,
            mailbox: env.SERVICE_MAILBOX,
            to: leave.employeeId.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            threadId: leave.gmail?.threadId
          });

          if (leave.gmail) {
            leave.gmail.decisionMsgId = result.id;
          } else {
            leave.gmail = { decisionMsgId: result.id };
          }
          await leave.save();
        } catch (error) {
          logger.warn('Gmail decision email failed:', error.message);
        }
      }
    } catch (error) {
      logger.error('Failed to send decision email:', error);
    }
  }
}