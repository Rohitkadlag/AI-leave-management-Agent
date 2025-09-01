// TODO: Add component content here
import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LEAVE_STATUS, URGENCY_COLORS, URGENCY_LABELS } from '../../utils/constants';

const LeaveCard = ({ leave, onApprove, onReject, onCancel, showActions = false }) => {
  const getDuration = () => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const days = differenceInDays(end, start) + 1;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const getStatusIcon = () => {
    switch (leave.status) {
      case LEAVE_STATUS.APPROVED:
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case LEAVE_STATUS.REJECTED:
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case LEAVE_STATUS.CANCELLED:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {leave.type.charAt(0) + leave.type.slice(1).toLowerCase()} Leave
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              {leave.employeeId?.name || 'Unknown Employee'}
            </p>
          </div>
        </div>
        <span className={`status-${leave.status.toLowerCase()}`}>
          {leave.status}
        </span>
      </div>

      {/* AI Analysis */}
      {leave.aiAnalysis && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🤖</span>
              <span className="text-sm font-medium text-blue-900">AI Analysis</span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <span className="text-gray-600">Urgency:</span>
                <span className={`ml-1 font-medium ${URGENCY_COLORS[leave.aiAnalysis.urgency]}`}>
                  {leave.aiAnalysis.urgency}/5 ({URGENCY_LABELS[leave.aiAnalysis.urgency]})
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Category:</span>
                <span className="ml-1 font-medium text-purple-600 capitalize">
                  {leave.aiAnalysis.category}
                </span>
              </div>
            </div>
          </div>
          {leave.aiAnalysis.reasoning && (
            <p className="text-sm text-blue-800 mt-2">
              <strong>AI Insight:</strong> {leave.aiAnalysis.reasoning}
            </p>
          )}
        </div>
      )}

      {/* Manager AI Recommendation */}
      {leave.managerAIRecommendation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-900">
              🎯 AI Recommendation: {leave.managerAIRecommendation.recommendation.toUpperCase()}
            </span>
            <span className="text-xs text-green-700">
              {leave.managerAIRecommendation.confidence}% confidence
            </span>
          </div>
          <p className="text-sm text-green-800 mt-1">
            {leave.managerAIRecommendation.reasoning}
          </p>
        </div>
      )}

      {/* Dates */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>{getDuration()}</span>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          <strong>Reason:</strong> {leave.reason}
        </p>
      </div>

      {/* Timeline */}
      {leave.timeline && leave.timeline.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
          <div className="space-y-2">
            {leave.timeline.slice(-2).map((event, index) => (
              <div key={index} className="flex items-center text-xs text-gray-600">
                <div className="h-2 w-2 bg-gray-400 rounded-full mr-2"></div>
                <span className="capitalize">{event.action.toLowerCase()}</span>
                {event.comment && <span className="ml-2 text-gray-500">- {event.comment}</span>}
                <span className="ml-auto">
                  {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && leave.status === LEAVE_STATUS.PENDING && (
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onApprove(leave._id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Approve
          </button>
          <button
            onClick={() => onReject(leave._id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <XCircleIcon className="h-4 w-4 mr-1" />
            Reject
          </button>
        </div>
      )}

      {showActions && leave.status === LEAVE_STATUS.PENDING && leave.employeeId?._id === leave.currentUserId && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onCancel(leave._id)}
            className="w-full btn-secondary text-sm"
          >
            Cancel Request
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveCard;