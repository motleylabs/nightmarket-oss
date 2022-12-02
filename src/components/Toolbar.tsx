import clsx from 'clsx';
import { ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps): JSX.Element {
  return (
    <header
      className={clsx(
        'top-0 my-4 mx-4 grid grid-cols-2 items-center justify-between gap-4 bg-black md:mx-10 md:flex',
        className
      )}
    >
      {children}
    </header>
  );
}
