// TODO: Add component content here
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROLES } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const { leaves, loading: leavesLoading } = useLeaves();

  if (leavesLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return <AdminDashboard leaves={leaves} />;
      case ROLES.MANAGER:
        return <ManagerDashboard leaves={leaves} />;
      case ROLES.EMPLOYEE:
        return <EmployeeDashboard leaves={leaves} />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome!</h2>
            <p className="text-gray-600">Unable to load dashboard for your role.</p>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;