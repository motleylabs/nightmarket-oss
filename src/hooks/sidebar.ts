import { useCallback, useState } from 'react';

interface SidebarContext {
  open: boolean;
  toggleSidebar: () => void;
}

export default function useSidebar(): SidebarContext {
  const [open, setSidebar] = useState<boolean>(true);

  const toggleSidebar = useCallback(() => {
    setSidebar(!open);
  }, [open, setSidebar]);

  return {
    open,
    toggleSidebar,
  };
}
