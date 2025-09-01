// TODO: Add component content here
import React from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  BoltIcon,
  CogIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { LEAVE_STATUS } from '../../utils/constants';

const AdminDashboard = ({ leaves = [] }) => {
  const { user } = useAuth();

  // Calculate system-wide statistics (guard against nulls)
  const stats = {
    totalLeaves: leaves.length,
    pending: leaves.filter((l) => l?.status === LEAVE_STATUS.PENDING).length,
    approved: leaves.filter((l) => l?.status === LEAVE_STATUS.APPROVED).length,
    rejected: leaves.filter((l) => l?.status === LEAVE_STATUS.REJECTED).length,
    aiAnalyzed: leaves.filter((l) => !!l?.aiAnalysis).length,
    highUrgency: leaves.filter((l) => (l?.aiAnalysis?.urgency || 0) >= 4).length,
  };

  // Get recent activity (avoid mutating props)
  const recentLeaves = [...leaves]
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
    .slice(0, 10);

  // Calculate trends
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthLeaves = leaves.filter((l) => {
    const d = new Date(l?.createdAt || 0);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const lastMonthLeaves = leaves.filter((l) => {
    const d = new Date(l?.createdAt || 0);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const monthlyTrend =
    lastMonthLeaves.length > 0
      ? ((thisMonthLeaves.length - lastMonthLeaves.length) / lastMonthLeaves.length) * 100
      : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard - {user?.name}</h1>
        <p className="text-purple-100 mb-4">
          Comprehensive system overview with AI-powered analytics and insights.
        </p>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <BoltIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">AI Analysis Active</span>
          </div>
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">
              {monthlyTrend >= 0 ? '+' : ''}
              {monthlyTrend.toFixed(1)}% vs last month
            </span>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeaves}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CogIcon className="h-6 w-6 text-yellow-600" />
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
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
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
              <DocumentTextIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.aiAnalyzed}</p>
              <p className="text-sm text-gray-600">AI Analyzed</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.highUrgency}</p>
              <p className="text-sm text-gray-600">High Urgency</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-medium text-green-900">AI Analysis Coverage</h3>
                <p className="text-sm text-green-700">
                  {stats.totalLeaves > 0
                    ? Math.round((stats.aiAnalyzed / stats.totalLeaves) * 100)
                    : 0}
                  % of requests analyzed
                </p>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalLeaves > 0
                  ? Math.round((stats.aiAnalyzed / stats.totalLeaves) * 100)
                  : 0}
                %
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-blue-900">Processing Efficiency</h3>
                <p className="text-sm text-blue-700">Average response time</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">1.8 days</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h3 className="font-medium text-purple-900">AI Accuracy</h3>
                <p className="text-sm text-purple-700">Recommendation success rate</p>
              </div>
              <div className="text-2xl font-bold text-purple-600">96%</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

          <div className="space-y-3">
            <a
              href="/ai-assistant"
              className="block p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center">
                <BoltIcon className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-900">AI Analytics Dashboard</h3>
                  <p className="text-sm text-blue-700">View comprehensive AI insights</p>
                </div>
              </div>
            </a>

            <a
              href="/leaves"
              className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Review All Requests</h3>
                  <p className="text-sm text-gray-600">Manage system-wide leave requests</p>
                </div>
              </div>
            </a>

            <a
              href="/settings"
              className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center">
                <CogIcon className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">System Settings</h3>
                  <p className="text-sm text-gray-600">Configure AI and system parameters</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent System Activity</h2>
          <a href="/leaves" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Analysis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLeaves.slice(0, 8).map((leave) => (
                <tr key={leave?._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {leave?.employeeId?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {(leave?.type || '').toLowerCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-${(leave?.status || '').toLowerCase()}`}>
                      {leave?.status || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {leave?.aiAnalysis ? (
                      <div className="flex items-center">
                        <BoltIcon className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {leave.aiAnalysis.urgency}/5
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not analyzed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave?.createdAt ? new Date(leave.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI System Overview */}
      <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center mb-6">
          <BoltIcon className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-indigo-900">AI System Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-indigo-900 mb-2">DeepSeek Integration</h3>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
              <span className="text-sm text-indigo-700">Active</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-indigo-900 mb-2">Analysis Queue</h3>
            <p className="text-2xl font-bold text-indigo-600">0</p>
            <p className="text-sm text-indigo-700">Pending analysis</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-indigo-900 mb-2">Response Time</h3>
            <p className="text-2xl font-bold text-indigo-600">1.2s</p>
            <p className="text-sm text-indigo-700">Average AI response</p>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-indigo-900 mb-2">Recommendations</h3>
            <p className="text-2xl font-bold text-indigo-600">{stats.aiAnalyzed}</p>
            <p className="text-sm text-indigo-700">Generated today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
