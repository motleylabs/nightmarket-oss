import type { NextApiRequest, NextApiResponse } from 'next';

import { createApiTransport } from '../api';
import type { RequestError, Instance } from '../api/types';
import { getSetCookiesList, replaceSetCookieDomain } from '../cookies';
import { logErrorDebug } from '../logger';
import { getApiRouteName } from './utils';
import { getLegacyErrorStatus, getLegacyErrorHeaders } from './utils';

export type ApiRouteHandler<T = unknown> = (ctx: {
  api: Instance;
  req: NextApiRequest;
  res: NextApiResponse<T>;
  method: NextApiRequest['method'];
}) =>
  | Promise<{
      data?: T;
      status: number | NextApiResponse['status'];
      headers?: Headers;
      xml?: unknown;
    } | void>
  | { data?: T; status: number | NextApiResponse['status']; headers?: Headers; xml?: unknown }
  | void;

export function composeApiRoute<T = void>(handler: ApiRouteHandler<T>) {
  return async function (req: NextApiRequest, res: NextApiResponse<T>) {
    const name = getApiRouteName(req);
    const method = req.method ?? undefined;

    try {
      const response = await handler({ api: createApiTransport(req), method, req, res });

      if (!response) {
        return res.status(405).end();
      }

      const { data, xml, headers, status } = response;

      if (xml && typeof status === 'number') {
        if (headers) {
          res.writeHead(status, Object.fromEntries(headers));
        } else {
          res.status(status);
        }

        res.write(xml);

        return res.end();
      }

      if (!data && !status) {
        return res.end();
      }

      if (!data && typeof status === 'number') {
        return res.status(status).end();
      }

      const setCookie = headers?.get('set-cookie') ?? '';

      if (!headers || !setCookie.length) {
        return res.status(status as number).json(data as T);
      }

      if (process.env.NODE_ENV === 'development') {
        const cookies = replaceSetCookieDomain(setCookie);

        cookies.length && res.setHeader('set-cookie', cookies);
      } else {
        res.setHeader('set-cookie', getSetCookiesList(setCookie));
      }

      res.status(status as number).json(data as T);
    } catch (err) {
      logErrorDebug('Next.js API route error', name, err);

      const errStatus = getLegacyErrorStatus(err);

      if (errStatus === 408) {
        return res.status(503).end();
      }

      if (errStatus === 400) {
        const _err = err as RequestError & {
          meta: { data: { errors: Record<string, string> } };
          data: { errors: Record<string, string>[] };
        };

        _err.body = _err.data ? Object.assign({}, ..._err.data.errors) : _err.meta.data.errors;

        if (typeof _err.body === 'string') {
          _err.body = {
            message: _err.body,
          };
        }

        return res.status(errStatus).json(_err.body as T);
      }

      if (errStatus) {
        res.writeHead(errStatus, getLegacyErrorHeaders(err));
      }

      // here we can log error to sentry or something

      res.status(503).end();
    }
  };
}
