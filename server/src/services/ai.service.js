import { getDeepSeekClient } from '../config/deepseek.js';
import { logger } from '../config/logger.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { User } from '../models/User.js';

export class AIService {
  static async analyzeLeaveRequest(leaveData, employeeData, teamData = []) {
    const client = getDeepSeekClient();
    if (!client) {
      logger.warn('DeepSeek not configured, returning basic analysis');
      return {
        urgency: 3,
        category: 'general',
        sentiment: 'neutral',
        riskScore: 2,
        recommendation: 'manual_review',
        reasoning: 'AI analysis unavailable - DeepSeek not configured'
      };
    }

    try {
      const systemPrompt = `You are an HR AI assistant that analyzes leave requests. 
      Return a JSON response with:
      - urgency (1-5): How urgent is this request
      - category: medical, personal, vacation, emergency, family, other
      - sentiment: positive, neutral, negative, urgent, distressed
      - riskScore (1-5): Potential risk/concern level
      - recommendation: approve, reject, manual_review, request_more_info
      - reasoning: Brief explanation of your analysis
      - suggestedQuestions: Array of follow-up questions if needed`;

      const userContext = `
      LEAVE REQUEST ANALYSIS:
      
      Employee: ${employeeData.name} (${employeeData.role})
      Leave Type: ${leaveData.type}
      Duration: ${leaveData.startDate} to ${leaveData.endDate}
      Reason: "${leaveData.reason}"
      
      Employee History:
      - Role: ${employeeData.role}
      - Manager: ${employeeData.managerId ? 'Assigned' : 'No manager'}
      
      Team Context:
      - Team size: ${teamData.length} members
      `;

      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContext }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      logger.info('Leave request AI analysis completed', { 
        urgency: analysis.urgency, 
        category: analysis.category 
      });

      return analysis;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return {
        urgency: 3,
        category: 'general',
        sentiment: 'neutral',
        riskScore: 2,
        recommendation: 'manual_review',
        reasoning: 'AI analysis failed - manual review required'
      };
    }
  }

  static async generateApprovalRecommendation(leave, manager, employee, teamData = []) {
    const client = getDeepSeekClient();
    if (!client) {
      return {
        recommendation: 'manual_review',
        confidence: 50,
        reasoning: 'AI recommendations unavailable - DeepSeek not configured'
      };
    }

    try {
      const systemPrompt = `You are an AI manager assistant that helps with leave approval decisions.
      Consider company policies, team coverage, employee history, and business impact.
      
      Return JSON with:
      - recommendation: approve, reject, conditional_approve, request_changes
      - confidence (0-100): How confident you are in this recommendation
      - reasoning: Detailed explanation
      - conditions: Array of conditions if conditional_approve
      - businessImpact: low, medium, high
      - coverageSuggestions: Array of coverage suggestions`;

      const context = `
      LEAVE APPROVAL DECISION SUPPORT:
      
      Employee: ${employee.name} (${employee.role})
      Leave Type: ${leave.type}
      Duration: ${leave.startDate} to ${leave.endDate}
      Reason: "${leave.reason}"
      Current Status: ${leave.status}
      
      Manager: ${manager.name}
      Team Size: ${teamData.length} members
      
      Leave Analysis: ${leave.aiAnalysis ? JSON.stringify(leave.aiAnalysis) : 'Not available'}
      `;

      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context }
        ],
        temperature: 0.2,
        max_tokens: 600
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Approval recommendation failed:', error);
      return {
        recommendation: 'manual_review',
        confidence: 50,
        reasoning: 'AI recommendation failed - manual review required'
      };
    }
  }

  static async processIntelligentEmail(emailBody, leaveId) {
    const client = getDeepSeekClient();
    if (!client) {
      // Fallback to basic keyword detection
      const bodyLower = emailBody.toLowerCase();
      if (bodyLower.includes('approved') || bodyLower.includes('approve')) {
        return { decision: 'APPROVED', confidence: 70, extractedInfo: 'Basic keyword detection' };
      } else if (bodyLower.includes('rejected') || bodyLower.includes('reject')) {
        return { decision: 'REJECTED', confidence: 70, extractedInfo: 'Basic keyword detection' };
      }
      return { decision: null, confidence: 0, extractedInfo: 'No clear decision found' };
    }

    try {
      const systemPrompt = `You are an AI email processor that extracts leave approval decisions from manager emails.
      
      Extract and return JSON with:
      - decision: APPROVED, REJECTED, PENDING, UNCLEAR
      - confidence (0-100): Confidence in the decision
      - extractedInfo: Summary of manager's response
      - conditions: Any conditions mentioned
      - requestedChanges: Changes requested if any
      - followUpNeeded: true/false if follow-up is required`;

      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `EMAIL CONTENT:\n${emailBody}` }
        ],
        temperature: 0.1,
        max_tokens: 300
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Email processing failed:', error);
      return { 
        decision: null, 
        confidence: 0, 
        extractedInfo: 'Email processing failed' 
      };
    }
  }

  static async chatAssistant(userMessage, userRole, context = {}) {
    const client = getDeepSeekClient();
    if (!client) {
      return {
        response: "I'm sorry, the AI assistant is currently unavailable. Please contact your HR department for assistance with leave management questions.",
        helpful: false
      };
    }

    try {
      const systemPrompt = `You are a helpful HR AI assistant for a leave management system.
      Help employees and managers with:
      - Leave policy questions
      - Application procedures
      - Status inquiries
      - General guidance
      
      User Role: ${userRole}
      Be professional, helpful, and concise. If you don't know something, direct them to HR.`;

      const contextInfo = Object.keys(context).length > 0 
        ? `\nContext: ${JSON.stringify(context)}` 
        : '';

      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage + contextInfo }
        ],
        temperature: 0.7,
        max_tokens: 400
      });

      return {
        response: response.choices[0].message.content,
        helpful: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Chat assistant failed:', error);
      return {
        response: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact HR directly.",
        helpful: false
      };
    }
  }

  static async predictLeavePatterns(employeeId, timeframe = 90) {
    const client = getDeepSeekClient();
    if (!client) {
      return { predictions: [], insights: 'AI predictions unavailable' };
    }

    try {
      // Get employee's leave history
      const leaveHistory = await LeaveRequest.find({ 
        employeeId,
        createdAt: { $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 });

      const employee = await User.findById(employeeId);

      const systemPrompt = `You are an AI that analyzes employee leave patterns and makes predictions.
      
      Return JSON with:
      - predictions: Array of predicted leave periods with reasoning
      - riskLevel: low, medium, high for burnout risk
      - recommendations: Suggestions for the employee/manager
      - patterns: Observed patterns in leave taking
      - healthScore (1-10): Overall work-life balance score`;

      const historyData = leaveHistory.map(leave => ({
        type: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        status: leave.status,
        reason: leave.reason.substring(0, 100) // Truncate for privacy
      }));

      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `
            EMPLOYEE ANALYSIS:
            Name: ${employee.name}
            Role: ${employee.role}
            Recent Leave History (${timeframe} days):
            ${JSON.stringify(historyData, null, 2)}
          `}
        ],
        temperature: 0.4,
        max_tokens: 600
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Leave pattern prediction failed:', error);
      return { 
        predictions: [], 
        insights: 'Pattern analysis failed',
        riskLevel: 'unknown'
      };
    }
  }
}