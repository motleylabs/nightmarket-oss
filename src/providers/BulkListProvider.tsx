import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

import type { Nft } from '../typings';

interface ContextProps {
  selected: Nft[];
  setSelected: Dispatch<SetStateAction<Nft[]>>;
}
const initContext: ContextProps = {
  selected: [],
  setSelected: () => null,
};
const BulkListContext = createContext(initContext);

export const useBulkListContext = () => useContext(BulkListContext);

interface ProviderProps {
  children: ReactNode;
}
const BulkListProvider = ({ children }: ProviderProps) => {
  const [selected, setSelected] = useState<Nft[]>([]);
  return (
    <BulkListContext.Provider value={{ selected, setSelected }}>
      {children}
    </BulkListContext.Provider>
  );
};
export default BulkListProvider;
