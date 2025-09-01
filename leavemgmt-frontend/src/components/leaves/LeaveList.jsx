import React, { useState } from 'react';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import LeaveCard from './LeaveCard';
import CreateLeaveForm from './CreateLeaveForm';
import { LEAVE_STATUS, LEAVE_TYPES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useLeaves } from '../../hooks/useLeaves';

const LeaveList = ({ leaves, onRefresh, showActions = false }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const { user } = useAuth();
  const { approveLeave, rejectLeave, cancelLeave } = useLeaves();

  const filteredLeaves = leaves.filter(leave => {
    const statusMatch = statusFilter === 'ALL' || leave.status === statusFilter;
    const typeMatch = typeFilter === 'ALL' || leave.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusCounts = () => {
    return {
      ALL: leaves.length,
      PENDING: leaves.filter(l => l.status === LEAVE_STATUS.PENDING).length,
      APPROVED: leaves.filter(l => l.status === LEAVE_STATUS.APPROVED).length,
      REJECTED: leaves.filter(l => l.status === LEAVE_STATUS.REJECTED).length,
      CANCELLED: leaves.filter(l => l.status === LEAVE_STATUS.CANCELLED).length
    };
  };

  const statusCounts = getStatusCounts();

  const handleCreateSuccess = (newLeave) => {
    onRefresh();
  };

  // Handle approve action
  const handleApprove = async (leaveId) => {
    try {
      await approveLeave(leaveId);
      onRefresh(); // Refresh the list after successful approval
    } catch (error) {
      console.error('Failed to approve leave:', error);
    }
  };

  // Handle reject action
  const handleReject = async (leaveId) => {
    try {
      await rejectLeave(leaveId);
      onRefresh(); // Refresh the list after successful rejection
    } catch (error) {
      console.error('Failed to reject leave:', error);
    }
  };

  // Handle cancel action
  const handleCancel = async (leaveId) => {
    try {
      await cancelLeave(leaveId);
      onRefresh(); // Refresh the list after successful cancellation
    } catch (error) {
      console.error('Failed to cancel leave:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
          <p className="text-gray-600">Manage your leave requests with AI-powered insights</p>
        </div>

        {user?.role === 'EMPLOYEE' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Request
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">All Status ({statusCounts.ALL})</option>
              <option value={LEAVE_STATUS.PENDING}>
                Pending ({statusCounts.PENDING})
              </option>
              <option value={LEAVE_STATUS.APPROVED}>
                Approved ({statusCounts.APPROVED})
              </option>
              <option value={LEAVE_STATUS.REJECTED}>
                Rejected ({statusCounts.REJECTED})
              </option>
              <option value={LEAVE_STATUS.CANCELLED}>
                Cancelled ({statusCounts.CANCELLED})
              </option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">All Types</option>
              {Object.values(LEAVE_TYPES).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leave Cards */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter !== 'ALL' || typeFilter !== 'ALL' 
                ? 'Try adjusting your filters to see more results.'
                : user?.role === 'EMPLOYEE' 
                  ? 'Create your first leave request to get started.'
                  : 'No leave requests to review at this time.'
              }
            </p>
            {user?.role === 'EMPLOYEE' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Leave Request
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredLeaves.map((leave) => (
              <LeaveCard
                key={leave._id}
                leave={leave}
                showActions={showActions}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Leave Modal */}
      <CreateLeaveForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default LeaveList;