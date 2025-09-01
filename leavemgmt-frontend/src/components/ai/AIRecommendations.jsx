// TODO: Add component content here
import React, { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const AIRecommendations = ({ leaves = [] }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    generateRecommendations();
  }, [leaves]);

  const generateRecommendations = () => {
    setLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const recs = [];
      
      // Check for pending leaves that need attention
      const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
      const oldPendingLeaves = pendingLeaves.filter(l => {
        const daysSince = Math.floor((new Date() - new Date(l.createdAt)) / (1000 * 60 * 60 * 24));
        return daysSince > 3;
      });

      if (oldPendingLeaves.length > 0) {
        recs.push({
          type: 'urgent',
          icon: ExclamationTriangleIcon,
          title: 'Old Pending Requests',
          description: `${oldPendingLeaves.length} leave request(s) have been pending for more than 3 days`,
          action: 'Review and respond to maintain team morale',
          priority: 'high'
        });
      }

      // Check for high urgency AI analyzed leaves
      const highUrgencyLeaves = leaves.filter(l => 
        l.aiAnalysis?.urgency >= 4 && l.status === 'PENDING'
      );

      if (highUrgencyLeaves.length > 0) {
        recs.push({
          type: 'ai_insight',
          icon: LightBulbIcon,
          title: 'High Urgency Requests',
          description: `AI identified ${highUrgencyLeaves.length} high-urgency leave request(s)`,
          action: 'Prioritize these requests for immediate review',
          priority: 'high'
        });
      }

      // Check for potential conflicts
      const upcomingLeaves = leaves.filter(l => {
        const startDate = new Date(l.startDate);
        const now = new Date();
        const daysDiff = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
        return daysDiff <= 14 && daysDiff > 0 && l.status === 'APPROVED';
      });

      if (upcomingLeaves.length > 2) {
        recs.push({
          type: 'planning',
          icon: ClockIcon,
          title: 'Upcoming Leave Cluster',
          description: `${upcomingLeaves.length} approved leaves starting within 2 weeks`,
          action: 'Consider workload distribution and coverage planning',
          priority: 'medium'
        });
      }

      // Pattern-based recommendations
      const sickLeaves = leaves.filter(l => l.type === 'SICK');
      const recentSickLeaves = sickLeaves.filter(l => {
        const daysSince = Math.floor((new Date() - new Date(l.createdAt)) / (1000 * 60 * 60 * 24));
        return daysSince <= 30;
      });

      if (recentSickLeaves.length >= 3) {
        recs.push({
          type: 'health',
          icon: ExclamationTriangleIcon,
          title: 'Increased Sick Leave Pattern',
          description: `${recentSickLeaves.length} sick leave requests in the last 30 days`,
          action: 'Consider wellness initiatives or workload assessment',
          priority: 'medium'
        });
      }

      // Positive recommendations
      if (pendingLeaves.length === 0) {
        recs.push({
          type: 'success',
          icon: CheckCircleIcon,
          title: 'All Requests Processed',
          description: 'Great job! No pending leave requests require attention',
          action: 'Continue maintaining quick response times',
          priority: 'low'
        });
      }

      setRecommendations(recs);
      setLoading(false);
    }, 1000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Generating AI recommendations..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <LightBulbIcon className="h-6 w-6 text-yellow-600 mr-2" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          <p className="text-sm text-gray-600">Smart suggestions for leave management</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="card text-center py-8">
          <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No recommendations at this time</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const IconComponent = rec.icon;
            return (
              <div key={index} className={`card ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <span className="text-sm">
                        {getPriorityIcon(rec.priority)} {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-sm font-medium text-gray-800 mt-2">{rec.action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {loading ? <LoadingSpinner size="small" text="" /> : 'Refresh Recommendations'}
        </button>
      </div>
    </div>
  );
};

export default AIRecommendations;