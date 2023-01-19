import clsx from "clsx"
import { useMemo, useState } from "react"
import { AuctionHouse, Nft } from "../../graphql.types"
import { useBulkListContext } from "../../providers/BulkListProvider"
import Button, { ButtonBackground, ButtonColor } from "../Button"
import CheckBox from "../CheckBox"
import Img from "../Image"
import BulkListModal from "./BulkListModal"

interface BulkListBottomDrawerProps {
  ownedNfts?: Nft[];
  auctionHouse: AuctionHouse;
  openDrawer: boolean
}
function BulkListBottomDrawer({ ownedNfts = [], auctionHouse, openDrawer}: BulkListBottomDrawerProps): JSX.Element {
  const { selected, setSelected } = useBulkListContext()
  const [listingOpen, setListingOpen] = useState(false)

  const unlistedNfts = useMemo(() => ownedNfts.filter(nft => !nft.listings || nft.listings.length === 0), [ownedNfts])

  const handleMassSelect = () => {
    if (selected.length < unlistedNfts.length) setSelected(unlistedNfts)
    else setSelected([])
  }

  const inView = selected.length > 0 || openDrawer
  const position = inView ? "translate-y-0" : "translate-y-36"

  return (
    <div className={clsx("transition-transform duration-1000 fixed bottom-0 w-full z-10", position)}>
      <div className="w-full bg-gradient-to-t from-black to-transparent flex justify-center p-2">
        <div className="z-20 rounded-full bg-gray-900 p-2 flex justify-center items-center gap-3 relative top-10">
          <Button onClick={handleMassSelect} background={ButtonBackground.Gray} className="text-left">
            <CheckBox
              label={`Select all unlisted (${unlistedNfts.length})`}
              selected={selected.length >= unlistedNfts.length}
              onClick={handleMassSelect}
              />
          </Button>
          <Button
            onClick={() => setListingOpen(true)}
            className="text-sm"
          >
            List selected ({selected.length})
          </Button>
        </div>
      </div>
      <div className="w-full bg-black h-12" />
      <div className="relative bg-gray-700 flex justify-between items-center py-[1.5rem] px-[1.5rem] sm:px=[2.5] h-[4.5rem] rounded-t-xl border-t border-gray-600/50">
        <div className="absolute left-0 top-1 w-full ">
          <div className="w-10 h-1 bg-gray-600 rounded-full m-auto"/>
        </div>
        {selected.length
          ? (
          <>
            <div className="flex gap-1 items-center overflow-hidden w-[60%] relative">
              {selected.map(nft => (
                <Img key={nft.address} src={nft.image} alt={nft.name} 
                  className="image-fit rounded-md h-[1.5rem] w-[1.5rem]"
                />
              ))}
            <div className="bg-gradient-to-l from-gray-700 to-transparent w-1/6 h-[1.5rem] absolute top-inherit right-0"/>
            </div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <p className="text-gray-500 font-bold w-full text-center">In Cart</p>
              <p className="bg-gradient-primary px-3 py-1 rounded-full">
                {selected.length}
              </p>
            </div>
          </>
          )
          : (
            <>
              <p className="text-gray-500 text-sm">No NFTs yet in our cart ;)</p>
              <img
                src="/images/moon.svg"
                className="w-[3rem] object-cover"
                alt="moon"
              />
            </>
          )
        }
      </div>
      

      <BulkListModal open={listingOpen} setOpen={setListingOpen} auctionHouse={auctionHouse} />
    </div>
  )
}

export default BulkListBottomDrawer