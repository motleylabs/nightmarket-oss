import type { api } from './api';

export const isRequestError = (e: unknown): e is RequestError => e instanceof RequestError;

export class RequestError extends Error {
  name: string;
  message: string;
  status: number;
  body: Record<string, unknown> | unknown;
  meta: { data?: { message?: string; errors?: Record<string, string>[] } | string };
  constructor(meta: Record<string, number>) {
    const name = `RequestError: ${meta.method} ${meta.status} ${meta.url}`;
    const message = JSON.stringify(meta.data);

    super(message);

    this.name = name;
    this.message = message;
    this.status = meta.status ?? 500;
    this.body = meta.body ?? '';
    this.meta = meta;
  }
}

export type Instance = typeof api;
