import { Dispatch, SetStateAction, useState } from 'react';

export default function useNavigation(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [showNav, setShowNav] = useState(false);

  return [showNav, setShowNav];
}
