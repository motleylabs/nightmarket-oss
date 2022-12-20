import clsx from "clsx"
import { useMemo, useState } from "react"
import { AuctionHouse, Nft } from "../../graphql.types"
import { useBulkListContext } from "../../providers/BulkListProvider"
import Button, { ButtonBackground, ButtonColor } from "../Button"
import CheckBox from "../CheckBox"
import BulkListModal from "./BulkListModal"

interface BulkListBottomDrawerProps {
  ownedNfts?: Nft[];
  auctionHouse: AuctionHouse
}
function BulkListBottomDrawer({ ownedNfts = [], auctionHouse }: BulkListBottomDrawerProps): JSX.Element {
  const { selected, setSelected } = useBulkListContext()
  const [listingOpen, setListingOpen] = useState(false)

  const unlistedNfts = useMemo(() => ownedNfts.filter(nft => !nft.listings || nft.listings.length === 0), [ownedNfts])

  const handleMassSelect = () => {
    if (selected.length < unlistedNfts.length) setSelected(unlistedNfts)
    else setSelected([])
  }

  const inView = selected.length > 0
  const position = inView ? "translate-y-0" : "translate-y-36"

  return (
    <div className={clsx("transition-transform duration-1000 fixed bottom-0 w-full z-10", position)}>
      <div className="w-full bg-gradient-to-t from-black to-transparent flex justify-center p-2">
        <div className="rounded-full bg-gray-900 p-2 flex justify-center flex-wrap gap-3 relative top-10">
          <Button onClick={handleMassSelect} background={ButtonBackground.Gray}>
            <CheckBox
              label={`Select all unlisted (${unlistedNfts.length})`}
              selected={selected.length >= unlistedNfts.length}
              onClick={handleMassSelect}
              />
          </Button>
          <Button
            onClick={() => setListingOpen(true)}
          >
            List selected ({selected.length})
          </Button>
        </div>
      </div>
      <div className="w-full bg-black h-20" />
      <BulkListModal open={listingOpen} setOpen={setListingOpen} auctionHouse={auctionHouse} />
    </div>
  )
}

export default BulkListBottomDrawer