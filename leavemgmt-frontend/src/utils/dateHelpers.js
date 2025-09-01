// TODO: Add component content here
import { format, differenceInDays, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const calculateDuration = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const days = differenceInDays(end, start) + 1;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

export const isDateInPast = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, startOfDay(new Date()));
};

export const isDateInFuture = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, startOfDay(new Date()));
};

export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate, 'MMM dd');
  const end = formatDate(endDate, 'MMM dd, yyyy');
  
  if (formatDate(startDate) === formatDate(endDate)) {
    return formatDate(startDate);
  }
  
  return `${start} - ${end}`;
};

export const getRelativeTime = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diff = differenceInDays(now, dateObj);
  
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';
  if (diff > 1) return `${diff} days ago`;
  if (diff < -1) return `In ${Math.abs(diff)} days`;
  
  return formatDate(date);
};

export const getTodayDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};