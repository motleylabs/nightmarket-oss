import { ReactElement } from "react"

interface OverviewLayoutProps {
  children: ReactElement
}
function OverviewLayout({ children }: OverviewLayoutProps) {
  return (
    <main>
      {children}
    </main>
  )
}

export default OverviewLayout