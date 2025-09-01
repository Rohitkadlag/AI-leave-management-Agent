// TODO: Add component content here
import React, { useState, useEffect } from 'react';
import { 
  BoltIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { URGENCY_COLORS, URGENCY_LABELS } from '../../utils/constants';

const AIInsights = () => {
  const { insights, getAIInsights, loading } = useAI();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.role === 'MANAGER' || user?.role === 'ADMIN') {
      getAIInsights();
    }
  }, [user, getAIInsights]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getAIInsights();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading AI insights..." />;
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No AI insights available</h3>
        <p className="mt-1 text-sm text-gray-500">AI insights are available for managers and administrators.</p>
      </div>
    );
  }

  const getPriorityColor = (insight) => {
    if (insight.requiresAttention) return 'border-red-200 bg-red-50';
    if (insight.aiAnalysis?.urgency >= 4) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BoltIcon className="h-6 w-6 text-primary-600 mr-2" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Insights Dashboard</h2>
            <p className="text-sm text-gray-600">
              Generated at {new Date(insights.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary text-sm"
        >
          {refreshing ? <LoadingSpinner size="small" text="" /> : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{insights.totalPending}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{insights.highPriority}</p>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {insights.totalPending > 0 
                  ? Math.round((insights.highPriority / insights.totalPending) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-gray-600">Require Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Leave Request Insights</h3>
        
        {insights.insights.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">No pending leave requests require immediate attention.</p>
          </div>
        ) : (
          insights.insights.map((insight) => (
            <div key={insight.leaveId} className={`card ${getPriorityColor(insight)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-gray-900">{insight.employee}</h4>
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {insight.type}
                    </span>
                    {insight.requiresAttention && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Urgent
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(insight.startDate).toLocaleDateString()} - {new Date(insight.endDate).toLocaleDateString()}
                  </p>

                  {insight.aiAnalysis && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">Urgency:</span>
                        <span className={`ml-1 text-sm font-medium ${URGENCY_COLORS[insight.aiAnalysis.urgency]}`}>
                          {insight.aiAnalysis.urgency}/5 ({URGENCY_LABELS[insight.aiAnalysis.urgency]})
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">Category:</span>
                        <span className="ml-1 text-sm font-medium text-purple-600 capitalize">
                          {insight.aiAnalysis.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">Risk:</span>
                        <span className="ml-1 text-sm font-medium text-orange-600">
                          {insight.aiAnalysis.riskScore}/5
                        </span>
                      </div>
                    </div>
                  )}

                  {insight.managerRecommendation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">
                          🎯 AI Recommendation: {insight.managerRecommendation.recommendation.toUpperCase()}
                        </span>
                        <span className="text-xs text-green-700">
                          {insight.managerRecommendation.confidence}% confidence
                        </span>
                      </div>
                      {insight.managerRecommendation.reasoning && (
                        <p className="text-sm text-green-800 mt-1">
                          {insight.managerRecommendation.reasoning}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="ml-4 text-right">
                  <p className="text-xs text-gray-500">
                    {insight.daysAgo === 0 ? 'Today' : `${insight.daysAgo} days ago`}
                  </p>
                  {insight.requiresAttention && (
                    <div className="mt-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {insights.insights.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing insights for {insights.insights.length} of {insights.totalPending} pending requests
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;