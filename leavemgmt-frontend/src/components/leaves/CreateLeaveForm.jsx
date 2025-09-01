// TODO: Add component content here
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LEAVE_TYPES } from '../../utils/constants';
import leaveService from '../../services/leave.service';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const leaveSchema = z.object({
  type: z.enum(Object.values(LEAVE_TYPES), {
    required_error: 'Please select a leave type'
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)')
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

const CreateLeaveForm = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(leaveSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const leave = await leaveService.createLeave(data);
      toast.success('Leave request submitted successfully! 🎉');
      reset();
      onSuccess(leave);
      onClose();
    } catch (error) {
      console.error('Error creating leave:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Create Leave Request
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select {...register('type')} className="input-field">
                <option value="">Select leave type</option>
                {Object.entries(LEAVE_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  {...register('startDate')}
                  type="date"
                  min={today}
                  className="input-field"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  {...register('endDate')}
                  type="date"
                  min={today}
                  className="input-field"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                {...register('reason')}
                rows={4}
                className="input-field resize-none"
                placeholder="Please provide a detailed reason for your leave request..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-blue-600">🤖</span>
                </div>
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-blue-900">AI Analysis</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your request will be automatically analyzed by AI for urgency, category, and approval recommendation.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLeaveForm;