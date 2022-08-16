import { MutableRefObject, ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
}

export function Toolbar({ children }: ToolbarProps): JSX.Element {
  return (
    <header className="top-0 z-10 flex flex-col items-center justify-between bg-gray-900 py-4 px-4 md:sticky md:flex-row md:px-8">
      {children}
    </header>
  );
}
