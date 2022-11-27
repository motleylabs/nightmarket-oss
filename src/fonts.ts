import localFont from '@next/font/local';

export const BriceFont = localFont({
  src: './Brice-Bold.woff2',
  weight: '700',
  style: 'normal',
  variable: '--font-brice',
});

export const HauoraFont = localFont({
  src: [
    { path: './Hauora-Regular.woff2', weight: '400', style: 'normal' },
    { path: './Hauora-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-hauora',
});