import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useCurrencies } from "../../hooks/currencies";
import { BulkListNftForm, useBulkListing } from "../../hooks/list";
import { useBulkListContext } from "../../providers/BulkListProvider";
import { roundToPrecision } from "../../utils/numbers";
import Button, { ButtonBackground } from "../Button";
import { Form } from "../Form";
import Icon from "../Icon";
import Modal from "../Modal"
import Tooltip from "../Tooltip";
import ListingItem from "./ListingItem";
import { AuctionHouse } from "../../graphql.types";
import clsx from "clsx";

interface BulkListModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  auctionHouse: AuctionHouse;
}

function BulkListModal({ open, setOpen, auctionHouse}: BulkListModalProps): JSX.Element {
  const { selected, setSelected } = useBulkListContext()
  const {solToUsdString} = useCurrencies()
  const [useGlobalPrice, setUseGlobalPrice] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    listingBulk,
    onCancelBulkListNftClick,
    handleSubmitBulkListNft,
    registerBulkListNft,
    bulkListNftState,
    onSubmitBulkListNft,
    amounts,
    globalBulkPrice
  } = useBulkListing();

  useEffect(() => {
    if (!open) onCancelBulkListNftClick();
  },[open, onCancelBulkListNftClick])


  const totalListed = Object.keys(amounts).length;

  const total = useGlobalPrice
    ? Number(globalBulkPrice) * totalListed || 0 //catch for NaN
    : Object.keys(amounts).reduce((acc, cur) => {
        return acc + parseFloat(amounts[cur] || "0")
      }, 0)

  const PnL = selected.reduce((acc, cur) => {
    if (cur.lastSale?.solPrice) {
      const listingPrice = parseFloat(amounts[cur.address] || "0")
      const pnl = listingPrice - cur.lastSale.solPrice
      return acc + pnl
    }
    return acc
  }, 0);

  const pnlColor = PnL < 0 ? "text-red-500" : "text-white"

  const txFees = useMemo(() => {
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

    const totalFee = txFee + computeFee
    return {
      fee: totalFee,
      feePercent: total ? (totalFee / total) * 100 : 0,
      rent: rentFee,
      rentPercent: total ? (rentFee / total) * 100 : 0,
    }
  }, [selected.length, total])
  
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSuccess(false)
      }, 1000)
    }
  }, [open])

  const handleList = async (form: BulkListNftForm) => {
    try {
      const { fulfilled } = await onSubmitBulkListNft({
        ...form,
        useGlobalPrice,
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

  const numberRegex = new RegExp(/^[0-9]*$/)

  const renderMainContent = () => (
    <Form onSubmit={handleSubmitBulkListNft(handleList)}>
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
          className={clsx("sm:w-1/2")}
          icon={<Icon.Sol defaultColor={useGlobalPrice ? "#A8A8A8" : "rgba(100,100,100,0.3)"} />}
          error={bulkListNftState.errors.globalBulkPrice}
          {...registerBulkListNft("globalBulkPrice", {
            required: useGlobalPrice,
            validate: value => Boolean(value.match(numberRegex)?.length)
          })}
          disabled={!useGlobalPrice}
        />
        <Form.Error message={bulkListNftState.errors.globalBulkPrice?.message} />
      </div>

      <div className="overflow-auto">
        {selected.map(nft => (
          <ListingItem
            key={nft.address}
            nft={nft}
            disabled={useGlobalPrice}
            bulkListNftState={bulkListNftState}
            registerBulkListNft={registerBulkListNft}
          />
        ))}
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
          <div className="flex gap-1 items-center -mt-[2px]">
              <p className="text-sm text-gray-400">PnL</p>
              <Icon.Info />
          </div>
          <div className="flex items-center gap-1">
            <Icon.Sol />
            <p className={pnlColor}>{roundToPrecision(PnL, 2)}</p>
          </div>
          <p className="text-sm text-gray-600 ml-5">{solToUsdString(PnL)}</p>
        </Tooltip>

        <Tooltip
          placement="top"
          content={(<>
            <p>Estimated Network Fee</p>
            <div className="flex gap-2">
              <p className="text-sm italic"><Icon.Sol className="inline-block w-3 h-3 mb-1" /> {roundToPrecision(txFees.fee, 6)}</p>
              <p className="text-gray-200 text-sm italic"> ({roundToPrecision(txFees.feePercent, 6)}%)</p>
            </div>
            <br />
            <p>Estimated Rent</p>
            <p className="text-sm italic text-gray-200">This will be refunded when sold or de-listed</p>
            <div className="flex gap-2">
              <p className="text-sm italic"><Icon.Sol className="inline-block w-3 h-3 mb-1" /> {roundToPrecision(txFees.rent, 6)}</p>
              <p className="text-gray-200 text-sm italic"> ({roundToPrecision(txFees.rentPercent, 6)}%)</p>
            </div>
          </>
          )}
          className="max-w-[18rem]"
          wrapperClass="justify-self-center"
        >
          <div className="flex gap-1 items-center -mt-[2px]">
            <p className="text-sm text-gray-400">Tx Fee</p>
            <Icon.Info />
          </div>
          <p className="text-gray-200">~{roundToPrecision(txFees.feePercent + txFees.rentPercent, 6)}%</p>
        </Tooltip>
        
        <div className="justify-self-end min-w-[4rem]">
          <p className="text-sm text-gray-400">Total</p>
          <div className="flex items-center gap-1">
            <Icon.Sol />
            <p>{roundToPrecision(total, 2)}</p>
          </div>
          <p className="text-sm text-gray-600 ml-5">{solToUsdString(total)}</p>
        </div>
      </div>
      {listingBulk
        ? <Button block loading background={ButtonBackground.Slate}>Please Wait</Button>
        : <Button block htmlType="submit">List now ({selected.length})</Button>
      }
    </Form>
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