import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useBulkListContext } from "../../providers/BulkListProvider";
import Button from "../Button";
import { Form } from "../Form";
import Icon from "../Icon";
import Modal from "../Modal"
import Tooltip from "../Tooltip";
import ListingItem from "./ListingItem";

interface BulkListModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
}
type PriceForm = { [nftAddress: string]: number | undefined}
function BulkListModal({ open, setOpen }: BulkListModalProps): JSX.Element {
  const { selected} = useBulkListContext()
  const [globalPrice, setGlobalPrice] = useState<number>()
  const [useGlobalPrice, setUseGlobalPrice] = useState(false)
  const [prices, setPrices] = useState<PriceForm>({})
  
  useEffect(() => {
    if (useGlobalPrice && globalPrice) {
      const globalPrices: PriceForm = {}
      selected.forEach(nft => {
        globalPrices[nft.address] = globalPrice
      })
      setPrices(globalPrices)
    }
  },[selected, useGlobalPrice, globalPrice])

  return (
    <Modal
      title="Bulk Listing"
      open={open}
      setOpen={setOpen}
    >
      <div className="my-6 flex justify-between items-center gap-2 p-2 bg-gray-800 rounded-lg">
        <label className="inline-flex relative cursor-pointer ml-3 items-center">
          <input type="checkbox" value="" checked={useGlobalPrice} className="sr-only peer" onChange={(e) => setUseGlobalPrice(e.target.checked)}/>
          <div className="w-12 h-7 bg-black rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-200 peer-checked:after:bg-gradient-secondary  after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          <span className="ml-3 text-gray-100">Global price</span>
          <Tooltip content="Global Price allows you to set one price for each selected NFT for a Bulk listing">
            <Icon.Info className="ml-2" />
          </Tooltip>
        </label>
        <Form.Input
          className="w-1/2"
          //saving for reference
          // error={offerFormState.errors.amount}
          // {...registerOffer('amount', { required: true })}
          // type="number"
          // min={0}
          icon={<Icon.Sol />}
          value={globalPrice}
          onChange={(e) => setGlobalPrice(parseInt(e.target.value) || undefined)}
        />
      </div>

      <div className="overflow-scroll">
        {selected.map(nft => {
          const onChange = (price?: number) => {
            setPrices(prev => {
              const copy = { ...prev }
              return {
                ...copy,
                [nft.address]: price
              }
            })
          }
          return (
            <ListingItem
              key={nft.address}
              nft={nft}
              price={prices[nft.address] || undefined}
              disabled={useGlobalPrice}
              onChange={onChange}
            />
          )
        })}
      </div>
      <hr className="w-[110%] relative -left-[5%] border-b-none border-t-[0.5px] border-gray-700/75"/>
      <div className="flex justify-between py-6">
        <div>
          Pnl
        </div>
        <div>
          0.1%
        </div>
        <div>
          Total
        </div>
      </div>
      <Button>List now</Button>

    </Modal>
  )
}

export default BulkListModal