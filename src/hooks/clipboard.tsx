import { useCallback, useState } from 'react';

export default function useClipboard(textToCopy: string) {
  const [copied, setCopied] = useState(false);
  const copyText = useCallback(async () => {
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [textToCopy]);

  return {
    copyText,
    copied,
  };
}
