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
  fallbackSrc?: string;
}

function Img({
  src,
  className,
  alt,
  backdrop = ImgBackdrop.Gray,
  fallbackSrc,
  ...props
}: ImgProps): JSX.Element {
  const [hideImage, setHideImage] = useState(true);
  const [hasImageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setHideImage(false);
    };

    image.onerror = () => {
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHideImage(false);
        setImageError(false);
      } else {
        setImageError(true);
      }
    };

    image.src = src as string;
    if (image.complete && image.naturalWidth !== 0) {
      setHideImage(false);
    }
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
      <img alt={alt} src={currentSrc} {...props} className={className} />
    </Transition>
  );
}

export default Img;
