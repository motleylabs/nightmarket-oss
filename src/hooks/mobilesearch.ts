import { Dispatch, SetStateAction, useState } from 'react';

interface MobileSearchMethods {
  searchExpanded: boolean;
  setSearchExpanded: Dispatch<SetStateAction<boolean>>;
  showMobileSearch: boolean;
  setShowMobileSearch: Dispatch<SetStateAction<boolean>>;
}

export default function useMobileSearch(): MobileSearchMethods {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return {
    searchExpanded,
    setSearchExpanded,
    showMobileSearch,
    setShowMobileSearch,
  };
}
