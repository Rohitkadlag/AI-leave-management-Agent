import { env } from '../config/env.js';
import { signJWT } from '../middleware/auth.js';
import { formatDateRange } from '../utils/date.js';

export const createApprovalToken = async (leaveId, managerId) => {
  return await signJWT({ leaveId, managerId, purpose: 'leave_decision' });
};

export const approvalRequestTemplate = async (leave, employee, manager) => {
  const token = await createApprovalToken(leave._id, manager._id);
  const dateRange = formatDateRange(leave.startDate, leave.endDate);
  
  const approveUrl = `${env.APP_BASE_URL}/api/leaves/${leave._id}/approve?actor=${manager._id}&token=${token}`;
  const rejectUrl = `${env.APP_BASE_URL}/api/leaves/${leave._id}/reject?actor=${manager._id}&token=${token}`;

  return {
    subject: `Leave Request - ${employee.name} (${leave.type})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Leave Request</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details</h3>
          <p><strong>Employee:</strong> ${employee.name} (${employee.email})</p>
          <p><strong>Type:</strong> ${leave.type}</p>
          <p><strong>Dates:</strong> ${dateRange}</p>
          <p><strong>Reason:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
            ${leave.reason}
          </p>
        </div>

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
          <p>This is an automated message from ${env.MAIL_SENDER_NAME}</p>
          <p>Leave ID: ${leave._id}</p>
        </div>
      </div>
    `
  };
};

export const decisionTemplate = (leave, employee, decision, comment = '') => {
  const dateRange = formatDateRange(leave.startDate, leave.endDate);
  const statusColor = decision === 'APPROVED' ? '#28a745' : '#dc3545';
  const statusIcon = decision === 'APPROVED' ? '✓' : '✗';

  return {
    subject: `Leave ${decision} - ${leave.type} (${dateRange})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">${statusIcon} Leave Request ${decision}</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Summary</h3>
          <p><strong>Type:</strong> ${leave.type}</p>
          <p><strong>Dates:</strong> ${dateRange}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${decision}</span></p>
        </div>

        ${comment ? `
        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #495057;">Manager's Comment:</h4>
          <p style="margin-bottom: 0;">${comment}</p>
        </div>
        ` : ''}

        <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
          <p>This is an automated message from ${env.MAIL_SENDER_NAME}</p>
          <p>Leave ID: ${leave._id}</p>
        </div>
      </div>
    `
  };
};