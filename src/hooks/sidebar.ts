import { useCallback, useEffect, useState } from 'react';

interface SidebarContext {
  open: boolean;
  toggleSidebar: () => void;
}

export default function useSidebar(): SidebarContext {
  const [open, setSidebar] = useState<boolean>(false);

  useEffect(() => {
    setSidebar(window.innerWidth >= 800);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebar(!open);
  }, [open, setSidebar]);

  return {
    open,
    toggleSidebar,
  };
}
