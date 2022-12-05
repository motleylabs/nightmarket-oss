import { DetailedHTMLProps, ImgHTMLAttributes, useEffect, useState, Fragment } from 'react';
import clsx from 'clsx';
import { Transition } from '@headlessui/react';

export enum ImgBackdrop {
  Gray = 'bg-gray-700',
  Cell = 'bg-gray-800',
}

interface ImgProps
  extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  backdrop?: ImgBackdrop;
}

function Img({
  src,
  className,
  alt,
  backdrop = ImgBackdrop.Gray,
  ...props
}: ImgProps): JSX.Element {
  const [hideImage, setHideImage] = useState(true);
  const [hasImageError, setImageError] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.src = src as string;

    image.onload = () => {
      setHideImage(false);
    };

    image.onerror = () => {
      setImageError(true);
    };
  }, [src]);

  if (hasImageError || hideImage) {
    return (
      <div
        className={clsx(className, backdrop, 'w-ful block aspect-square', {
          'animate-pulse': !hasImageError,
        })}
      />
    );
  }

  return (
    <Transition
      as={Fragment}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterLeave={() => {}}
      show={true}
    >
      <img alt={alt} src={src} {...props} className={className} />
    </Transition>
  );
}

export default Img;
