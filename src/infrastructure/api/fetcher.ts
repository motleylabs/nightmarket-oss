import { api } from './api';

export async function fetcher<T>(url: string, query?: string): Promise<T> {
  return api.get<T>(`${url}${query ? `?${query}` : ''}`).then((r) => r.data);
}
