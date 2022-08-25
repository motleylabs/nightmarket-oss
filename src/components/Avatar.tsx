import clsx from 'clsx';
import React from 'react';

export enum AvatarSize {
  Tiny,
  Small,
  Standard,
  Large,
  Jumbo,
  Gigantic,
}

interface AvatarProps {
  src: string;
  circle?: boolean;
  size: AvatarSize;
}

export function Avatar({ src, circle, size }: AvatarProps) {
  return (
    <img
      src={src}
      alt="avatar"
      className={clsx('aspect-square object-cover', {
        'rounded-full': circle,
        'h-10 w-10': size === AvatarSize.Standard,
        'h-16 w-16': size === AvatarSize.Large,
        'rounded-md': !circle && [AvatarSize.Tiny, AvatarSize.Small].includes(size),
        'rounded-lg': !circle && [AvatarSize.Standard, AvatarSize.Large].includes(size),
        'rounded-xl': !circle && [AvatarSize.Jumbo, AvatarSize.Gigantic].includes(size),
      })}
    />
  );
}
