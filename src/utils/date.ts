import { formatDistanceToNow, parseISO } from 'date-fns';

export function formatToNow(date: number): string | undefined {
  if (!date) {
    return undefined;
  }

  const createdAt = new Date(date * 1000).toISOString();

  return formatDistanceToNow(parseISO(createdAt), { addSuffix: true });
}
