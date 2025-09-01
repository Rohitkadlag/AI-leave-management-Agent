// TODO: Add component content here
import React, { useState } from 'react';
import { 
  PlusIcon, 
  CalendarIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LeaveCard from '../leaves/LeaveCard';
import CreateLeaveForm from '../leaves/CreateLeaveForm';
import { LEAVE_STATUS } from '../../utils/constants';

const EmployeeDashboard = ({ leaves }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  // Filter leaves for current user
  const myLeaves = leaves.filter(leave => leave.employeeId?._id === user?._id);
  
  // Calculate statistics
  const stats = {
    total: myLeaves.length,
    pending: myLeaves.filter(l => l.status === LEAVE_STATUS.PENDING).length,
    approved: myLeaves.filter(l => l.status === LEAVE_STATUS.APPROVED).length,
    rejected: myLeaves.filter(l => l.status === LEAVE_STATUS.REJECTED).length
  };

  // Get recent leaves
  const recentLeaves = myLeaves
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Get upcoming approved leaves
  const upcomingLeaves = myLeaves
    .filter(l => l.status === LEAVE_STATUS.APPROVED && new Date(l.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100 mb-4">
          Manage your leave requests with AI-powered insights and recommendations.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-primary-600 font-medium py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Leave Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
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
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Requests */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
            <a
              href="/leaves"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </a>
          </div>

          <div className="space-y-4">
            {recentLeaves.length === 0 ? (
              <div className="card text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
                <p className="text-gray-600 mb-4">You haven't created any leave requests yet.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Request
                </button>
              </div>
            ) : (
              recentLeaves.map((leave) => (
                <LeaveCard
                  key={leave._id}
                  leave={leave}
                  showActions={false}
                />
              ))
            )}
          </div>
        </div>

        {/* Upcoming Leaves */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Approved Leaves</h2>
          
          <div className="space-y-4">
            {upcomingLeaves.length === 0 ? (
              <div className="card text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Leaves</h3>
                <p className="text-gray-600">You don't have any approved upcoming leaves.</p>
              </div>
            ) : (
              upcomingLeaves.map((leave) => (
                <div key={leave._id} className="card bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-green-900">
                        {leave.type.charAt(0) + leave.type.slice(1).toLowerCase()} Leave
                      </h3>
                      <p className="text-sm text-green-700">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="status-approved">Approved</span>
                      <p className="text-xs text-green-600 mt-1">
                        {Math.ceil((new Date(leave.startDate) - new Date()) / (1000 * 60 * 60 * 24))} days to go
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">🤖</span>
          <h2 className="text-xl font-semibold text-blue-900">AI Insights for You</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Smart Recommendations</h3>
            <p className="text-sm text-blue-800">
              AI analyzes your leave patterns to suggest optimal timing for requests.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Approval Insights</h3>
            <p className="text-sm text-blue-800">
              Get AI-powered predictions on approval likelihood before submitting.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Chat Assistant</h3>
            <p className="text-sm text-blue-800">
              Ask AI questions about leave policies and get instant answers.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <a
            href="/ai-assistant"
            className="btn-primary"
          >
            Explore AI Features →
          </a>
        </div>
      </div>

      {/* Create Leave Modal */}
      <CreateLeaveForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          window.location.reload(); // Simple refresh for demo
        }}
      />
    </div>
  );
};

export default EmployeeDashboard;