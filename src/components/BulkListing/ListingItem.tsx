import { useTranslation } from 'next-i18next';
import type { FormState, UseFormRegister } from 'react-hook-form';

import { useCurrencies } from '../../hooks/currencies';
import type { BulkListNftForm } from '../../hooks/list';
import type { Nft } from '../../typings';
import { getAssetURL, AssetSize } from '../../utils/assets';
import { getSolFromLamports } from '../../utils/price';
import { Form } from '../Form';
import Icon from '../Icon';
import Image from '../Image';
import Tooltip from '../Tooltip';
import { NUMBER_REGEX } from './BulkListModal';

interface ListingItemProps {
  nft: Nft;
  price?: string;
  disabled: boolean;
  registerBulkListNft: UseFormRegister<BulkListNftForm>;
  bulkListNftState: FormState<BulkListNftForm>;
  success: boolean;
  failed: boolean;
}
export default function ListingItem({
  nft,
  disabled,
  registerBulkListNft,
  bulkListNftState,
  success,
  failed,
}: ListingItemProps): JSX.Element {
  const { t } = useTranslation('profile');
  const { solToUsdString } = useCurrencies();
  const lastSale = nft.lastSale;
  const collectionName = nft.name;

  const renderInfoTooltip = () =>
    !!lastSale ? (
      <Tooltip
        content={
          <div>
            <p className="mb-1 text-xs font-bold text-gray-600">
              {t('bulkListing.lastSalePrice', { ns: 'profile' })}
            </p>
            <div className="flex gap-1">
              <Icon.Sol />
              <p>{getSolFromLamports(lastSale.price, 0, 3)}</p>
            </div>
            <p className="ml-5 text-xs font-bold text-gray-600">
              {solToUsdString(getSolFromLamports(lastSale.price))}
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
        <div className="relative">
          <Image
            src={getAssetURL(nft.image, AssetSize.XSmall)}
            alt="nft image"
            className="h-14 w-14 rounded-lg border-2 border-solid border-gray-400/50 object-cover"
          />
          {success && (
            <div className="absolute -top-2 -right-2 rounded-full bg-white">
              <Icon.Success />
            </div>
          )}
          {failed && (
            <div className="absolute -top-2 -right-2 rounded-full bg-black">
              <Icon.Failed />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1">
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
          error={bulkListNftState.errors.amounts?.[nft.mintAddress]}
          {...registerBulkListNft(`amounts.${nft.mintAddress}`, {
            required: !disabled,
            validate: (value) =>
              !disabled ? Boolean(+value) && Boolean(value.match(NUMBER_REGEX)?.length) : true,
          })}
          autoComplete="off"
          icon={<Icon.Sol defaultColor={!disabled ? '#A8A8A8' : 'rgba(100,100,100,0.3)'} />}
          disabled={disabled}
        />
        <Form.Error message={bulkListNftState.errors.amounts?.[nft.mintAddress]?.message} />
      </div>
    </div>
  );
}
