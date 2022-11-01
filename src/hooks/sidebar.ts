import { useCallback, useEffect, useState } from 'react';

interface SidebarContext {
  open: boolean;
  toggleSidebar: () => void;
}

export default function useSidebar(): SidebarContext {
  const [open, setSidebar] = useState<boolean>(true);

  useEffect(() => {
    if (window.innerWidth <= 800) {
      setSidebar(false);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebar(!open);
  }, [open, setSidebar]);

  return {
    open,
    toggleSidebar,
  };
}
