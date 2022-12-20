import { Nft } from "../../graphql.types";
import { useCurrencies } from "../../hooks/currencies";
import { Form } from "../Form";
import Icon from "../Icon";
import Image from "../Image";
import Tooltip from "../Tooltip";


interface ListingItemProps {
  nft: Nft;
  price?: number;
  disabled: boolean;
  onChange: (price?: number) => void; 
}
export default function ListingItem({ nft, price, disabled, onChange }: ListingItemProps): JSX.Element {
  const {solToUsdString} = useCurrencies()
  const lastSale = nft.lastSale;
  const collectionName = nft.moonrankCollection?.name;

  const renderInfoTooltip = () => lastSale?.solPrice
    ? (
      <Tooltip 
        content={(
          <div>
            <p className="text-xs text-gray-600 font-bold mb-1">LAST SALE PRICE</p>
            <div className="flex gap-1">
              <Icon.Sol />
              <p>{lastSale.solPrice}</p>
            </div>
            <p className="text-xs font-bold text-gray-600 float-right">{solToUsdString(lastSale.solPrice)}</p>
          </div>
        )}
        placement="right"
      >
        <Icon.Dollar className="inline mb-1" />
      </Tooltip>
    )
    :null

  return (
    <div className="bg-gray-800 rounded-lg mb-3 flex justify-between p-4">
      <div className="flex gap-5 items-center">
        <Image src={nft.image} alt="nft image" className="h-14 w-14 rounded-lg object-cover border-solid border-2 border-gray-400/50" />
        <div>
          <div className="flex gap-2">
            <p className="mb-1 whitespace-nowrap text-ellipsis overflow-hidden max-w-[10rem]">{nft.name} </p>
            {renderInfoTooltip()}
          </div>
          <p className="text-sm text-gray-400 font-bold">{collectionName}</p>
        </div>
      </div>

      <Form.Input
        className="w-36"
        icon={<Icon.Sol />}
        value={price}
        disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value) || undefined)}
      />
    </div>
  )
}
