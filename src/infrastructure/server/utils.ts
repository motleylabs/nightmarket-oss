import type { OutgoingHttpHeaders } from 'http';
import type { ParsedUrlQuery } from 'querystring';

import type { RequestError } from '../api/types';

export type LegacyRequestError = RequestError & {
  data?: unknown;
  meta: { data?: { code?: string; message?: string; errors?: Record<string, string>[] } };
};

export function getApiRouteName(req: {
  url?: string;
  resolvedUrl?: string;
  query: ParsedUrlQuery;
}): string | null {
  const path = req.url || req.resolvedUrl || null;

  let name = path?.split('?')[0] || null;

  if (name && req.query) {
    for (const param in req.query) {
      const value = req.query[param];

      if (typeof value === 'string') {
        name = name.replace(value, `[${param}]`);
      }
    }
  }

  return name;
}

type LegacyErrorWithHeaders = Error & { headers?: OutgoingHttpHeaders };

export function getLegacyErrorHeaders(err: unknown): OutgoingHttpHeaders {
  if (err !== null && typeof err === 'object' && err instanceof Error) {
    return (err as LegacyErrorWithHeaders).headers ?? {};
  }

  return {};
}

type LegacyErrorWithStatus = Error & { status?: number };

export function getLegacyErrorStatus(err: unknown): number | null {
  if (err !== null && typeof err === 'object' && err instanceof Error) {
    return (err as LegacyErrorWithStatus).status ?? null;
  }

  return null;
}
