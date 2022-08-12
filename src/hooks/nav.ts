import { useWindowWidth } from '@react-hook/window-size';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const TAIWIND_SCREEN_MD_WIDTH = 768;

export default function useNavigation(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [showNav, setShowNav] = useState(false);
  const windowWidth = useWindowWidth();

  useEffect(() => {
    const isMDScreen = windowWidth > TAIWIND_SCREEN_MD_WIDTH;

    if (showNav) {
      document.body.className = 'overflow-hidden';
    }

    if (isMDScreen || !showNav) {
      document.body.className = 'overflow-auto';
    }
  }, [showNav, windowWidth]);

  return [showNav, setShowNav];
}
