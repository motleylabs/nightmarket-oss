import { formatDistanceToNow, intlFormatDistance } from 'date-fns';

export function formatTimeAgo(date: Date) {
  const pastDate = new Date(date);

  const result = formatDistanceToNow(pastDate);
  return result;
}
