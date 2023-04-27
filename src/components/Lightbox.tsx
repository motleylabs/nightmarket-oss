import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

import clsx from 'clsx';
import React, { useRef } from 'react';

interface LightboxProps {
  children: JSX.Element | JSX.Element[];
  show: boolean;
  onDismiss: () => void;
}

function Lightbox({ children, show, onDismiss }: LightboxProps): JSX.Element {
  const expandedRef = useRef<HTMLDivElement>(null!);

  return (
    <div
      role="dialog"
      onClick={onDismiss}
      className={clsx(
        'fixed inset-0',
        'cursor-pointer bg-gray-800 bg-opacity-40 backdrop-blur-lg',
        'transition-opacity duration-500 ease-in-out',
        'z-50 flex flex-col items-center justify-center',
        {
          'opacity-100': show,
          'opacity-0': !show,
          'pointer-events-auto': show,
          'pointer-events-none': !show,
          'z-50': show,
        }
      )}
    >
      <div
        ref={expandedRef}
        className={clsx(
          `relative z-50 flex aspect-auto w-full flex-col overflow-x-auto overflow-y-auto rounded-lg text-white shadow-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-900 sm:h-auto `,
          'px-4 sm:h-auto sm:max-w-2xl'
        )}
      >
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

interface LightboxExpandProps {
  onClick: () => void;
}

function LightboxShow({ onClick }: LightboxExpandProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 bg-opacity-20 text-white backdrop-blur-sm transition ease-in-out hover:scale-110 md:bottom-6 md:right-6"
    >
      <ArrowsPointingOutIcon className="h-4 w-4" />
    </button>
  );
}

Lightbox.Show = LightboxShow;

interface LightboxContainerProps {
  children: JSX.Element[];
}
function LightboxContainer({ children }: LightboxContainerProps): JSX.Element {
  return <div className="relative">{children}</div>;
}

Lightbox.Container = LightboxContainer;

export default Lightbox;
