// TODO: Add component content here
import { useState, useEffect, useCallback } from 'react';
import leaveService from '../services/leave.service';
import { useApi } from './useApi';

export const useLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const { execute } = useApi();

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leaveService.getMyLeaves();
      setLeaves(data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLeave = useCallback(async (leaveData) => {
    const result = await execute(
      () => leaveService.createLeave(leaveData),
      { 
        showSuccessToast: true, 
        successMessage: 'Leave request created successfully!' 
      }
    );
    
    // Add the new leave to the local state
    setLeaves(prev => [result, ...prev]);
    return result;
  }, [execute]);

  const approveLeave = useCallback(async (leaveId, comment) => {
    const result = await execute(
      () => leaveService.approveLeave(leaveId, comment),
      { 
        showSuccessToast: true, 
        successMessage: 'Leave approved successfully!' 
      }
    );
    
    // Update the leave in local state
    setLeaves(prev => prev.map(leave => 
      leave._id === leaveId ? result : leave
    ));
    return result;
  }, [execute]);

  const rejectLeave = useCallback(async (leaveId, comment) => {
    const result = await execute(
      () => leaveService.rejectLeave(leaveId, comment),
      { 
        showSuccessToast: true, 
        successMessage: 'Leave rejected successfully!' 
      }
    );
    
    // Update the leave in local state
    setLeaves(prev => prev.map(leave => 
      leave._id === leaveId ? result : leave
    ));
    return result;
  }, [execute]);

  const cancelLeave = useCallback(async (leaveId) => {
    const result = await execute(
      () => leaveService.cancelLeave(leaveId),
      { 
        showSuccessToast: true, 
        successMessage: 'Leave cancelled successfully!' 
      }
    );
    
    // Update the leave in local state
    setLeaves(prev => prev.map(leave => 
      leave._id === leaveId ? result : leave
    ));
    return result;
  }, [execute]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return {
    leaves,
    loading,
    fetchLeaves,
    createLeave,
    approveLeave,
    rejectLeave,
    cancelLeave
  };
};