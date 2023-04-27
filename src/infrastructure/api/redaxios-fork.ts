// @ts-nocheck
import AbortController from 'abort-controller';
import type { IncomingHttpHeaders } from 'http';
import { stringify } from 'querystring';

export const isRequestError = (e: unknown): e is RequestError => e instanceof RequestError;

export class RequestError extends Error {
  name: string;
  message: string;
  status: number;
  body: Record<string, unknown> | unknown;
  meta: { data: { message?: string; errors?: Record<string, string>[] } | string };
  constructor(meta: Record<string, string | number>) {
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

/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type Method = 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE';
export type Options = {
  url?: string;
  method?: Method;
  baseURL?: string;
  headers?: Record<string, string> | Headers | IncomingHttpHeaders;
  body?: FormData | string | Record<string, unknown>;
  responseType?: 'text' | 'json' | 'stream' | 'blob' | 'arrayBuffer' | 'formData' | 'stream';
  data?: unknown;
  auth?: string;
  retry?: boolean;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
};

export type Response<T> = {
  ok: boolean;
  status: number;
  statusText: string;
  config: Options;
  data: T;
  headers: Headers;
  redirect: boolean;
  url: string;
  type: ResponseType;
  body: ReadableStream<Uint8Array> | null;
  bodyUsed: boolean;
};

export const axios = (function create(defaults: Partial<Options> = {}) {
  redaxios.request = redaxios;
  redaxios.get = <T = unknown>(url: string, config?: Options): Promise<Response<T>> =>
    redaxios(url, config, 'GET');
  redaxios.delete = <T = unknown>(url: string, config?: Options): Promise<Response<T>> =>
    redaxios(url, config, 'DELETE');
  redaxios.post = <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: Options
  ): Promise<Response<T>> => redaxios(url, config, 'POST', data);
  redaxios.put = <T = unknown, D extends Record<string, string> = unknown>(
    url: string,
    data?: D,
    config?: Options
  ): Promise<Response<T>> => redaxios(url, config, 'PUT', data);
  redaxios.patch = <T = unknown>(
    url: string,
    data?: unknown,
    config?: Options
  ): Promise<Response<T>> => redaxios(url, config, 'PATCH', data);

  /**
   * Issues a request.
   * @public
   * @template T
   * @param {string | Options} url
   * @param {Options} [config]
   * @param {any} [_method]
   * @param {any} [_data]
   * @returns {Promise<Response<T>>}
   */

  function redaxios(url: string, config?: Options | undefined, _method?: Method, _data?: unknown) {
    if (typeof url !== 'string') {
      config = url;
      url = config.url;
    }

    const response: Response = { config };
    const options: Options = { ...defaults, ...config };
    const headers: Headers = { ...defaults?.headers, ...config?.headers };

    let data = _data || options.data;

    // Check if `.append` isn't function for FormData
    if (typeof data === 'object' && data !== null && typeof data.append !== 'function') {
      data = JSON.stringify(data);
      headers['content-type'] = 'application/json';
    }

    if (options.auth) {
      headers.authorization = options.auth;
    }

    if (options.baseURL) {
      url = `${options.baseURL}${url}`;
    }

    if (options.params) {
      url = `${url}?${stringify(options.params)}`;
    }

    const init = {
      method: _method || options.method || 'GET',
      body: data,
      headers,
      signal: options?.signal,
    };

    const fetcher = options.retry ? fetchWithRetry : fetch;
    const start = Date.now();

    return fetcher(url, init).then((res) => {
      for (const i in res) {
        if (typeof res[i] !== 'function') {
          response[i] = res[i];
        }
      }

      if (options.responseType === 'stream') {
        response.data = res.body;

        return response;
      }

      return res[options.responseType || 'text']()
        .then((data) => {
          response.data = data;
          // its okay if this fails: response.data will be the unparsed value
          response.data = JSON.parse(data);
        })
        .catch(Object)
        .then(() => {
          if (process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.info(
              `%c%s %c%s %s`,
              'font-weight: bold',
              init.method,
              'font-weight: normal',
              res.status,
              url,
              typeof window !== 'undefined' ? response.data : ''
            );
          }

          if (!response.ok) {
            return Promise.reject(
              new RequestError({
                url,
                duration: Date.now() - start,
                method: init.method,
                ...response,
              })
            );
          }

          return response;
        });
    });
  }

  redaxios.CancelToken = typeof AbortController === 'function' ? AbortController : Object;
  redaxios.defaults = defaults;
  redaxios.create = create;

  return redaxios;
})();

async function fetchWithRetry(
  url: string,
  init,
  retries = 1,
  ms = process.env.NEXT_PUBLIC_DEBUG || process.env.NODE_ENV === 'development' ? 20000 : 12000
): Promise<globalThis.Response> {
  if (retries <= 0) {
    return fetch(url, init);
  }

  for (let depth = 0, timeout = ms; depth <= retries; depth++) {
    const controller = new AbortController();
    const signal = controller.signal;
    const abortTimeout = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, { ...init, signal });

      clearTimeout(abortTimeout);

      return response;
    } catch (err) {
      if (err.name !== 'AbortError') {
        throw err;
      }

      timeout = ms * Math.LOG2E ** depth;
    } finally {
      clearTimeout(abortTimeout);
    }
  }

  return new Response(null, {
    url,
    status: 408,
    statusText: 'Request timeout',
  });
}
