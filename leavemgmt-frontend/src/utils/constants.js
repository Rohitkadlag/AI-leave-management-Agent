// TODO: Add component content here
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
};

export const LEAVE_TYPES = {
  CASUAL: 'CASUAL',
  SICK: 'SICK',
  EARNED: 'EARNED',
  UNPAID: 'UNPAID'
};

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

export const URGENCY_COLORS = {
  1: 'text-green-600',
  2: 'text-green-500',
  3: 'text-yellow-500',
  4: 'text-orange-500',
  5: 'text-red-500'
};

export const URGENCY_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical'
};