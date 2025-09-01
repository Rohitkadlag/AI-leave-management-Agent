// TODO: Add component content here
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  IdentificationIcon,
  CalendarIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { formatUserRole } from '../utils/formatters';
import { LEAVE_STATUS } from '../utils/constants';

const Profile = () => {
  const { user } = useAuth();
  const { leaves } = useLeaves();

  const getLeaveStats = () => {
    const currentYear = new Date().getFullYear();
    const yearLeaves = leaves.filter(leave => 
      new Date(leave.createdAt).getFullYear() === currentYear
    );

    return {
      total: yearLeaves.length,
      approved: yearLeaves.filter(l => l.status === LEAVE_STATUS.APPROVED).length,
      pending: yearLeaves.filter(l => l.status === LEAVE_STATUS.PENDING).length,
      rejected: yearLeaves.filter(l => l.status === LEAVE_STATUS.REJECTED).length
    };
  };

  const stats = getLeaveStats();

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information and view your leave statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center mb-6">
              <UserCircleIcon className="h-6 w-6 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                  {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">{formatUserRole(user?.role)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Employee ID</p>
                    <p className="font-medium text-gray-900">{user?._id?.substring(0, 8) || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium text-gray-900">{formatUserRole(user?.role)}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Statistics */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Leave Statistics</h3>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">This Year ({new Date().getFullYear()})</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Requests</span>
                <span className="text-lg font-bold text-gray-900">{stats.total}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Approved</span>
                <span className="text-lg font-bold text-green-600">{stats.approved}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-700">Pending</span>
                <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-700">Rejected</span>
                <span className="text-lg font-bold text-red-600">{stats.rejected}</span>
              </div>
            </div>

            {stats.total > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Approval Rate</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {Math.round((stats.approved / (stats.total - stats.pending)) * 100) || 0}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Card */}
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">🤖</span>
              <h3 className="text-lg font-semibold text-blue-900">AI Profile Insights</h3>
            </div>
            
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Your leave patterns are analyzed by AI for better planning</p>
              <p>• Requests are automatically categorized and prioritized</p>
              <p>• Get personalized recommendations in the AI Assistant</p>
            </div>

            <div className="mt-4">
              <a 
                href="/ai-assistant" 
                className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
              >
                Explore AI Features →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;