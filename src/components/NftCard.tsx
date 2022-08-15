import { ReactNode } from "react";

interface NftCardProps {
  children: ReactNode;
}

export function NftCard({ children }: NftCardProps): JSX.Element {

  return (
    <div className="rounded-full text-white shadow-lg">
      {children}
    </div>
  )
}
