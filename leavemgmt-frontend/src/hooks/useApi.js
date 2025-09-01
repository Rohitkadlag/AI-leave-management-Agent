// TODO: Add component content here
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showSuccessToast = false, 
      successMessage = 'Operation successful',
      showErrorToast = true,
      loadingMessage = null
    } = options;

    try {
      setLoading(true);
      setError(null);
      
      if (loadingMessage) {
        toast.loading(loadingMessage);
      }

      const result = await apiCall();

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  }, []);

  return { loading, error, execute };
};