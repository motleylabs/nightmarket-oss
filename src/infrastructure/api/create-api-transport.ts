import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';

import { axios } from './redaxios-fork';
import type { Instance } from './types';
import { getBaseApiUrl } from './utils';

export function createApiTransport(
  req?: IncomingMessage & { cookies: Partial<{ [key: string]: string }> },
  res?: ServerResponse,
  { url }: { token?: string; url?: string } = {}
): Instance {
  const baseApiUrl = getBaseApiUrl();
  const baseURL = url || baseApiUrl.url;

  let auth: string | undefined;
  const headers: IncomingHttpHeaders = {};

  if (req?.headers?.authorization) {
    auth = req.headers.authorization;
  }

  if (req?.headers?.cookie) {
    headers.cookie = req.headers.cookie;
  }

  if (process.env.HTTP_HOST) {
    headers.host = process.env.HTTP_HOST;
  }

  if (process.env.X_FORWARDED_HOST) {
    headers['X-Forwarded-Host'] = process.env.X_FORWARDED_HOST;
  }

  if (!headers['X-Forwarded-Proto'] || headers['X-Forwarded-Proto'] === 'http') {
    headers['X-Forwarded-Proto'] = 'https';
  }

  return axios.create({
    baseURL,
    auth,
    headers,
    retry: true,
  });
}
