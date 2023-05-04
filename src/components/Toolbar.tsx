import clsx from 'clsx';
import type { ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <header
      className={clsx(
        'top-0 my-4 mx-4 md:flex items-center justify-between gap-4 bg-black md:mx-10 md:flex',
        className
      )}
    >
      {children}
    </header>
  );
}
