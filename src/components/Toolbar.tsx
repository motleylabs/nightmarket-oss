import clsx from 'clsx';
import { MutableRefObject, ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps): JSX.Element {
  return (
    <header className={clsx('top-0 z-10 flex flex-col items-center justify-between bg-gray-900 py-4 px-4 md:sticky md:flex-row md:px-8', className)}>
      {children}
    </header>
  );
}
