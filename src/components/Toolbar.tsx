import { ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
}

export function Toolbar({ children }: ToolbarProps): JSX.Element {
  return (
    <header className="flex flex-col items-center justify-between py-4 px-4 md:flex-row md:px-8">
      {children}
    </header>
  );
}
