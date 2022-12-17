import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import { Nft } from "../graphql.types";


interface ContextProps {
  selected: Nft[];
  setSelected: Dispatch<SetStateAction<Nft[]>>
}
const initContext: ContextProps = {
  selected: [],
  setSelected: () => null
}
const BulkListContext = createContext(initContext)
export const useBulkListContext = () => useContext(BulkListContext)

interface ProviderProps {
  children: ReactNode
}
const BulkListProvider = ({ children }: ProviderProps) => {
  const [selected, setSelected] = useState<Nft[]>([]);
  return (
    <BulkListContext.Provider
      value={{ selected, setSelected }}
    >
      {children}
    </BulkListContext.Provider>
  )
}
export default BulkListProvider