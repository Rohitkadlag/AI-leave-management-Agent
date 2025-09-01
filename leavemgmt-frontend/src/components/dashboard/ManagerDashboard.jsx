// TODO: Add component content here
import React from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LeaveCard from '../leaves/LeaveCard';
import AIRecommendations from '../ai/AIRecommendations';
import { LEAVE_STATUS } from '../../utils/constants';

const ManagerDashboard = ({ leaves = [] }) => {
  const { user } = useAuth();

  // Filter leaves for manager's team (guard against nulls)
  const teamLeaves = leaves.filter(
    (leave) => leave?.managerId?._id && user?._id && leave.managerId._id === user._id
  );

  // Calculate statistics
  const stats = {
    total: teamLeaves.length,
    pending: teamLeaves.filter((l) => l?.status === LEAVE_STATUS.PENDING).length,
    approved: teamLeaves.filter((l) => l?.status === LEAVE_STATUS.APPROVED).length,
    rejected: teamLeaves.filter((l) => l?.status === LEAVE_STATUS.REJECTED).length,
    urgent: teamLeaves.filter((l) => (l?.aiAnalysis?.urgency || 0) >= 4).length,
  };

  // Get pending leaves that need attention
  const pendingLeaves = teamLeaves
    .filter((l) => l?.status === LEAVE_STATUS.PENDING)
    .sort((a, b) => (b?.aiAnalysis?.urgency || 0) - (a?.aiAnalysis?.urgency || 0))
    .slice(0, 5);

  // Get urgent leaves
  const urgentLeaves = teamLeaves
    .filter((l) => (l?.aiAnalysis?.urgency || 0) >= 4 && l?.status === LEAVE_STATUS.PENDING)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Manager Dashboard - {user?.name}</h1>
        <p className="text-green-100 mb-4">
          Review team leave requests with AI-powered insights and recommendations.
        </p>
        <div className="flex items-center">
          <BoltIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">AI-Enhanced Decision Support Active</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Team Requests</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              <p className="text-sm text-gray-600">AI Urgent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Reviews */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Pending Reviews</h2>
            <a href="/leaves" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </a>
          </div>

          <div className="space-y-4">
            {pendingLeaves.length === 0 ? (
              <div className="card text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending leave requests to review.</p>
              </div>
            ) : (
              pendingLeaves.map((leave) => (
                <LeaveCard key={leave?._id} leave={leave} showActions={true} />
              ))
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <AIRecommendations leaves={teamLeaves} />
        </div>
      </div>

      {/* High Priority Section */}
      {urgentLeaves.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center mb-6">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-red-900">
              High Priority - Immediate Action Required
            </h2>
          </div>

          <div className="space-y-4">
            {urgentLeaves.map((leave) => (
              <div key={leave?._id} className="bg-white rounded-lg border border-red-200">
                <LeaveCard leave={leave} showActions={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Analytics */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-blue-900">Team Analytics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Response Time</h3>
            <p className="text-2xl font-bold text-blue-600">1.2 days</p>
            <p className="text-sm text-blue-700">Average review time</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Approval Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-blue-700">Team leave approvals</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">AI Accuracy</h3>
            <p className="text-2xl font-bold text-purple-600">94%</p>
            <p className="text-sm text-blue-700">Recommendation match</p>
          </div>
        </div>

        <div className="mt-4">
          <a href="/ai-assistant" className="btn-primary">
            View Detailed AI Insights →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
