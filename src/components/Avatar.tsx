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
        'w-12': size === AvatarSize.Standard,
        'w-16': size === AvatarSize.Large,
        'rounded-md': !circle && [AvatarSize.Tiny, AvatarSize.Small, AvatarSize.Standard, AvatarSize.Large].includes(size),
        'rounded-lg': !circle && [AvatarSize.Jumbo, AvatarSize.Gigantic].includes(size),
      })}
    />
  );
}
