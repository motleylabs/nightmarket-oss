import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useCurrencies } from "../../hooks/currencies";
import { useListNft } from "../../hooks/list";
import { useBulkListContext } from "../../providers/BulkListProvider";
import { roundToPrecision } from "../../utils/numbers";
import Button, { ButtonBackground } from "../Button";
import { Form } from "../Form";
import Icon from "../Icon";
import Modal from "../Modal"
import Tooltip from "../Tooltip";
import ListingItem from "./ListingItem";
import config from '../../app.config'
import { AuctionHouse } from "../../graphql.types";

interface BulkListModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  auctionHouse: AuctionHouse;
}
type PriceForm = { [nftAddress: string]: string | undefined}
function BulkListModal({ open, setOpen, auctionHouse}: BulkListModalProps): JSX.Element {
  const { selected, setSelected } = useBulkListContext()
  const {solToUsdString} = useCurrencies()
  const [globalPrice, setGlobalPrice] = useState<string>()
  const [useGlobalPrice, setUseGlobalPrice] = useState(false)
  const [prices, setPrices] = useState<PriceForm>({})
  const [success, setSuccess] = useState(false)

  const {
    listNft,
    handleSubmitListNft,
    registerListNft,
    listNftState,
    onSubmitBulkListNft
  } = useListNft();

  const total = Object.keys(prices).reduce((acc, cur) => {
    return acc + parseFloat(prices[cur] || "0")
  }, 0)

  const PnL = selected.reduce((acc, cur) => {
    if (cur.lastSale?.solPrice) {
      const listingPrice = parseFloat(prices[cur.address] || "0")
      const pnl = listingPrice - cur.lastSale.solPrice
      return acc + pnl
    }
    return acc 
  }, 0)

  const pnlColor = PnL < 0 ? "text-red-500" : "text-white"

  const getTxFee = () => {
    const numListing = selected.length
    const listingsPerTx = 6 //roughly 6 listings per tx

    const baseTxFee = 0.00005 //SOL
    const baseRent = 0.02 //SOL
    const computeIncrease = 0.00001 //SOL

    const numTx = Math.ceil(numListing / listingsPerTx) 
    const computeIncRate = 2 // every 2 Tx
    const numIncreases = (numTx - 1) * computeIncRate

    const txFee = baseTxFee * numTx;
    const computeFee = computeIncrease * numIncreases
    const rentFee = baseRent * numListing; //Will be refunded on sell/delist

    const totalFee = txFee + computeFee + rentFee
    return {
      sol: totalFee,
      percent: total ? (totalFee/total) * 100 : 0
    }
  } 
  
  useEffect(() => {
    if (useGlobalPrice && globalPrice) {
      const globalPrices: PriceForm = {}
      selected.forEach(nft => {
        globalPrices[nft.address] = globalPrice
      })
      setPrices(globalPrices)
    }
  }, [selected, useGlobalPrice, globalPrice])

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSuccess(false)
      }, 1000)
    }
  }, [open])

  const handleList = async () => {
    try {
      const { fulfilled } = await onSubmitBulkListNft({
        amounts: prices as { [address: string]: string },
        nfts: selected,
        auctionHouse: auctionHouse
      })
      if (fulfilled.length) {
        setSuccess(true)
        setSelected(prev => {
          const copy = [...prev]
          return copy.filter(nft => !fulfilled.includes(nft))
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  const renderMainContent = () => (
    <>
      <div className="my-6 flex justify-between items-center gap-2 p-4 sm:p-2 bg-gray-800 rounded-lg flex-wrap">
        <label className="inline-flex relative cursor-pointer ml-3 items-center">
          <input type="checkbox" value="" checked={useGlobalPrice} className="sr-only peer" onChange={(e) => setUseGlobalPrice(e.target.checked)}/>
          <div className="w-12 h-7 bg-black rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-200 peer-checked:after:bg-gradient-secondary  after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          <span className="ml-3 text-gray-100">Global price</span>
          <Tooltip content="Global Price allows you to set one price for each selected NFT for a Bulk listing">
            <Icon.Info className="ml-2" />
          </Tooltip>
        </label>
        <Form.Input
          className="sm:w-1/2"
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
        <Tooltip
          placement="top"
          content={(<>
            <p>PnL stands for profit and loss, and it can be either realized or unrealized.</p>
            <p className="italic mt-1">Note: if last sale price per NFT is not detected, the PnL value will not be accurate.</p>
          </>
          )}
          className="max-w-[14rem]"
        >
          <div>
            <div className="flex gap-1 items-center -mt-[2px]">
                <p className="text-sm text-gray-400">PnL</p>
                <Icon.Info />
            </div>
            <div className="flex items-center gap-1">
              <Icon.Sol />
              <p className={pnlColor}>{roundToPrecision(PnL, 2)}</p>
            </div>
            <p className="text-sm text-gray-600 ml-5">{solToUsdString(PnL)}</p>
          </div>
        </Tooltip>

        <div className="justify-self-center">
          <p className="text-sm text-gray-400">Tx Fee</p>
          {/* <p className="text-gray-200">{getTxFee().sol} SOL</p> */}
          <p className="text-gray-200">~{roundToPrecision(getTxFee().percent, 6)}%</p>
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
      {listNft
        ? <Button loading background={ButtonBackground.Slate}>Please Wait</Button>
        : <Button onClick={handleSubmitListNft(handleList)}>List now ({selected.length})</Button>
      }
    </>
  )

  return (
    <Modal
      title="Bulk Listing"
      open={open}
      setOpen={setOpen}
    >
      {success 
      ? <img
            src="/images/moon success.svg"
            className="w-auto object-fill px-5 py-32"
            alt="success"
          />
      : renderMainContent()
      }

    </Modal>
  )
}

export default BulkListModal