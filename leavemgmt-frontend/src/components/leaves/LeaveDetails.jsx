// TODO: Add component content here
import React from 'react';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { URGENCY_COLORS, URGENCY_LABELS } from '../../utils/constants';
import { calculateDuration } from '../../utils/dateHelpers';

const LeaveDetails = ({ leave }) => {
  if (!leave) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'CANCELLED': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {leave.type.charAt(0) + leave.type.slice(1).toLowerCase()} Leave
          </h2>
          <p className="text-gray-600 mt-1">
            Request ID: {leave._id}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
          {leave.status}
        </div>
      </div>

      {/* Basic Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Employee</p>
                <p className="font-medium text-gray-900">{leave.employeeId?.name}</p>
              </div>
            </div>

            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Length</p>
                <p className="font-medium text-gray-900">{calculateDuration(leave.startDate, leave.endDate)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(leave.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {leave.reason}
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      {leave.aiAnalysis && (
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🤖</span>
            <h3 className="text-lg font-semibold text-blue-900">AI Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Urgency Level</p>
              <p className={`text-xl font-bold ${URGENCY_COLORS[leave.aiAnalysis.urgency]}`}>
                {leave.aiAnalysis.urgency}/5
              </p>
              <p className="text-xs text-gray-500">
                {URGENCY_LABELS[leave.aiAnalysis.urgency]}
              </p>
            </div>

            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-xl font-bold text-purple-600 capitalize">
                {leave.aiAnalysis.category}
              </p>
              <p className="text-xs text-gray-500">
                {leave.aiAnalysis.sentiment}
              </p>
            </div>

            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Risk Score</p>
              <p className="text-xl font-bold text-orange-600">
                {leave.aiAnalysis.riskScore}/5
              </p>
              <p className="text-xs text-gray-500">
                Risk Level
              </p>
            </div>
          </div>

          {leave.aiAnalysis.reasoning && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">AI Insights</h4>
              <p className="text-blue-800">{leave.aiAnalysis.reasoning}</p>
            </div>
          )}

          {leave.aiAnalysis.suggestedQuestions && leave.aiAnalysis.suggestedQuestions.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Suggested Follow-up Questions</h4>
              <ul className="space-y-1">
                {leave.aiAnalysis.suggestedQuestions.map((question, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="mr-2">•</span>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Manager AI Recommendation */}
      {leave.managerAIRecommendation && (
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🎯</span>
            <h3 className="text-lg font-semibold text-green-900">Manager AI Recommendation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Recommendation</p>
              <p className="text-xl font-bold text-green-600 uppercase">
                {leave.managerAIRecommendation.recommendation}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="text-xl font-bold text-green-600">
                {leave.managerAIRecommendation.confidence}%
              </p>
            </div>
          </div>

          {leave.managerAIRecommendation.reasoning && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Reasoning</h4>
              <p className="text-green-800">{leave.managerAIRecommendation.reasoning}</p>
            </div>
          )}

          {leave.managerAIRecommendation.conditions && leave.managerAIRecommendation.conditions.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Suggested Conditions</h4>
              <ul className="space-y-1">
                {leave.managerAIRecommendation.conditions.map((condition, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {leave.timeline && leave.timeline.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          
          <div className="space-y-4">
            {leave.timeline.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 mr-4"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {event.action.toLowerCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                  {event.comment && (
                    <p className="text-sm text-gray-600 mt-1">{event.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveDetails;