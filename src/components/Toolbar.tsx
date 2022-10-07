import clsx from 'clsx';
import { MutableRefObject, ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps): JSX.Element {
  return (
    <header
      className={clsx(
        'top-0 z-10 my-4 mx-4 grid grid-cols-2 items-center justify-between gap-4 bg-black md:sticky md:mx-10 md:flex',
        className
      )}
    >
      {children}
    </header>
  );
}
