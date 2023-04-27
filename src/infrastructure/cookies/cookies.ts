import type { IncomingMessage, ServerResponse } from 'http';
import type { GetServerSidePropsContext } from 'next';
import { setCookie as set, destroyCookie, parseCookies } from 'nookies';

import { Time } from '../../libs/consts';

const { hostname } = new URL(process.env.NEXT_PUBLIC_BASE_URL as string);

const domain = process.env.NODE_ENV === 'production' ? `.${hostname}` : hostname;
const path = '/';

export function getAllCookies(ctx: { req: IncomingMessage } | null = null) {
  return parseCookies(ctx);
}

export function getCookie(name: string, ctx: GetServerSidePropsContext | null = null) {
  const cookies = getAllCookies(ctx);

  return cookies[name];
}

export function setCookie<T>(
  key: string,
  value: T,
  params: {
    sameSite?: string;
    encode?: (value: T) => string;
    maxAge?: string;
    expires?: Date;
    ctx?: GetServerSidePropsContext | null;
  } = {
    ctx: null,
  }
): void {
  const { ctx, ...restParams } = params;

  set(ctx, key, value as unknown as string, {
    domain,
    path,
    encode: (value: string) => value,
    maxAge: Time.WEEK,
    sameSite: 'strict',
    ...restParams,
  });
}

export function removeCookie(key: string, ctx: { res?: ServerResponse } | null = null) {
  destroyCookie(ctx, key, { domain, path });
}

export function getSetCookiesList(cookies: string) {
  if (!cookies.length) {
    return [];
  }

  return cookies
    .split(' Secure, ')
    .map((s) => (s.includes('Secure') ? s : s.concat(' Secure')))
    .filter((i) => !!i);
}

export function replaceSetCookieDomain(cookies: string) {
  if (!cookies.length) {
    return [];
  }

  const cookie = cookies
    .split('; ')
    .map((s) => (s.includes('Domain') ? 'Domain=localhost' : s))
    .join('; ');

  return getSetCookiesList(cookie);
}
