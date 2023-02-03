import { Nft } from '../../graphql.types';
import { useCurrencies } from '../../hooks/currencies';
import { Form } from '../Form';
import Icon from '../Icon';
import Image from '../Image';
import Tooltip from '../Tooltip';
import { FormState, UseFormRegister } from 'react-hook-form';
import { BulkListNftForm } from '../../hooks/list';
import { NUMBER_REGEX } from './BulkListModal';

interface ListingItemProps {
  nft: Nft;
  price?: string;
  disabled: boolean;
  registerBulkListNft: UseFormRegister<BulkListNftForm>;
  bulkListNftState: FormState<BulkListNftForm>;
}
export default function ListingItem({
  nft,
  disabled,
  registerBulkListNft,
  bulkListNftState,
}: ListingItemProps): JSX.Element {
  const { solToUsdString } = useCurrencies();
  const lastSale = nft.lastSale;
  const collectionName = nft.moonrankCollection?.name;

  const renderInfoTooltip = () =>
    lastSale?.solPrice ? (
      <Tooltip
        content={
          <div>
            <p className="mb-1 text-xs font-bold text-gray-600">LAST SALE PRICE</p>
            <div className="flex gap-1">
              <Icon.Sol />
              <p>{lastSale.solPrice}</p>
            </div>
            <p className="ml-5 text-xs font-bold text-gray-600">
              {solToUsdString(lastSale.solPrice)}
            </p>
          </div>
        }
        placement="right"
      >
        <Icon.Dollar className="mb-1 inline" />
      </Tooltip>
    ) : null;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-800 p-4">
      <div className="flex items-center gap-5">
        <Image
          src={nft.image}
          alt="nft image"
          className="h-14 w-14 rounded-lg border-2 border-solid border-gray-400/50 object-cover"
        />
        <div>
          <div className="flex gap-1">
            <p className="mb-1 max-w-[11rem] overflow-hidden text-ellipsis whitespace-nowrap">
              {nft.name}
            </p>
            {renderInfoTooltip()}
          </div>
          <p className="text-sm font-bold text-gray-400">{collectionName}</p>
        </div>
      </div>

      <div className="w-full sm:w-36">
        <Form.Input
          error={bulkListNftState.errors.amounts?.[nft.address]}
          {...registerBulkListNft(`amounts.${nft.address}`, {
            required: !disabled,
            validate: (value) => (!disabled ? Boolean(value.match(NUMBER_REGEX)?.length) : true),
          })}
          icon={<Icon.Sol defaultColor={!disabled ? '#A8A8A8' : 'rgba(100,100,100,0.3)'} />}
          disabled={disabled}
        />
        <Form.Error message={bulkListNftState.errors.amounts?.[nft.address]?.message} />
      </div>
    </div>
  );
}
