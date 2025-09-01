// TODO: Add component content here
import React from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { useAuth } from '../contexts/AuthContext';
import LeaveList from '../components/leaves/LeaveList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROLES } from '../utils/constants';

const Leaves = () => {
  const { leaves, loading, fetchLeaves } = useLeaves();
  const { user } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Loading leaves..." />;
  }

  const showActions = user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN;

  return (
    <div className="animate-fade-in">
      <LeaveList 
        leaves={leaves} 
        onRefresh={fetchLeaves}
        showActions={showActions}
      />
    </div>
  );
};

export default Leaves;