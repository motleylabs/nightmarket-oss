import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useCurrencies } from "../../hooks/currencies";
import { useBulkListContext } from "../../providers/BulkListProvider";
import { roundToPrecision } from "../../utils/numbers";
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
type PriceForm = { [nftAddress: string]: string | undefined}
function BulkListModal({ open, setOpen }: BulkListModalProps): JSX.Element {
  const { selected } = useBulkListContext()
  const {solToUsdString} = useCurrencies()
  const [globalPrice, setGlobalPrice] = useState<string>()
  const [useGlobalPrice, setUseGlobalPrice] = useState(false)
  const [prices, setPrices] = useState<PriceForm>({})

  const total = Object.keys(prices).reduce((acc, cur) => {
    return acc + parseFloat(prices[cur] || "0")
  }, 0)

  const totalPrevSales = selected.reduce((acc, cur) => {
    const sale = cur.lastSale?.solPrice ? cur.lastSale.solPrice : 0
    return acc + sale
  }, 0)

  const PnL = total - totalPrevSales
  const pnlColor = PnL < 0 ? "text-red-500" : "text-white"
  
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
          // error={offerFormState.errors.amount}   
          icon={<Icon.Sol />}
          value={globalPrice}
          onChange={(e) => setGlobalPrice(e.target.value)}
        />
      </div>

      <div className="overflow-scroll">
        {selected.map(nft => {
          const onChange = (price?: string) => {
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
      <div className="w-full grid grid-cols-3 gap-2 py-6">
        <div>
          <div className="flex gap-1 items-center">
            <p className="text-sm text-gray-400">PnL</p>
            <Tooltip content="PnL stands for profit and loss, and it can be either realized or unrealized." className="max-w-[14rem]">
              <Icon.Info />
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            <Icon.Sol />
            <p className={pnlColor}>{roundToPrecision(PnL, 2)}</p>
          </div>
          <p className="text-sm text-gray-600 ml-5">{solToUsdString(PnL)}</p>
        </div>

        <div className="justify-self-center">
          <p className="text-sm text-gray-400">Service Fee</p>
          <p>0.1% placeholder</p>
        </div>
        
        <div className="justify-self-end min-w-[4rem]">
          <p className="text-sm text-gray-400">Total</p>
          <div className="flex items-center gap-1">
            <Icon.Sol />
            <p>{roundToPrecision(total, 2)}</p>
          </div>
          <p className="text-sm text-gray-600 ml-5">{solToUsdString(total)}</p>
        </div>
      </div>
      <Button>List now ({selected.length})</Button>

    </Modal>
  )
}

export default BulkListModal