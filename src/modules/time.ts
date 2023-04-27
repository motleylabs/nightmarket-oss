import { addHours, formatDistanceToNow } from 'date-fns';

export function formatTimeAgo(date: Date) {
  const pastDate = new Date(date);

  const result = formatDistanceToNow(pastDate);
  return result;
}

export enum DateRangeOption {
  HOUR = '1',
  DAY = '24',
  WEEK = '168',
  MONTH = '720',
}

export function getDateTimeRange(dateRangeOption: DateRangeOption): {
  startTime: number;
  endTime: number;
} {
  const now = new Date();
  const endTime = addHours(now, 1).setMinutes(0, 0, 0) / 1000;
  const startTime = endTime - (parseInt(dateRangeOption, 10) + 1) * 3600;

  return { startTime, endTime };
}
