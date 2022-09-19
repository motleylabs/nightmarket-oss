import { RefObject, useEffect } from 'react';

export function useOutsideAlert(ref: RefObject<Node>, cb: VoidFunction) {
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref?.current && !ref?.current?.contains(event.target as Node)) {
        cb();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cb, ref]);
}
