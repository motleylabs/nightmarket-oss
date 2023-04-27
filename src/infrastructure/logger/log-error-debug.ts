export function logErrorDebug(...args: Parameters<typeof console.error>) {
  if (process.env.DEBUG !== 'true') {
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[DEBUG ERROR]', ...args);
}
