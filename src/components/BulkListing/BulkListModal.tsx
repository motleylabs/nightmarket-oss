import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import { useCurrencies } from '../../hooks/currencies';
import type { BulkListNftForm } from '../../hooks/list';
import { useBulkListing } from '../../hooks/list';
import { useBulkListContext } from '../../providers/BulkListProvider';
import type { Nft } from '../../typings';
import { roundToPrecision } from '../../utils/numbers';
import Button, { ButtonBackground } from '../Button';
import { Form } from '../Form';
import Icon from '../Icon';
import Modal from '../Modal';
import Tooltip from '../Tooltip';
import ListingItem from './ListingItem';

// NB. this regex accept values of 0 so need more validation than just this regex on inputs
export const NUMBER_REGEX = new RegExp(/^\d*\.?\d{1,9}$/);

interface BulkListModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
}

function BulkListModal({ open, setOpen }: BulkListModalProps): JSX.Element {
  const { t } = useTranslation('profile');
  const { selected, setSelected } = useBulkListContext();
  const { solToUsdString } = useCurrencies();
  const [useGlobalPrice, setUseGlobalPrice] = useState(false);
  const [success, setSuccess] = useState<Nft[]>([]);
  const [failed, setFailed] = useState<Nft[]>([]);

  const {
    listingBulk,
    onCancelBulkListNftClick,
    handleSubmitBulkListNft,
    registerBulkListNft,
    bulkListNftState,
    onSubmitBulkListNft,
    amounts,
    globalBulkPrice,
  } = useBulkListing();

  useEffect(() => {
    if (!open) onCancelBulkListNftClick();
  }, [open, onCancelBulkListNftClick]);

  const totalListed = Object.keys(amounts).length;

  const total = useGlobalPrice
    ? Number(globalBulkPrice) * totalListed || 0 //catch for NaN
    : Object.keys(amounts).reduce((acc, cur) => {
        return acc + parseFloat(amounts[cur] || '0');
      }, 0);

  useEffect(() => {
    if (!open) {
      setSuccess([]);
      setFailed([]);
      setSelected([]);
    }
  }, [open, setSelected]);

  const handleList = async (form: BulkListNftForm) => {
    try {
      const { fulfilled } = await onSubmitBulkListNft({
        ...form,
        useGlobalPrice,
        nfts: selected,
      });
      if (fulfilled.length) {
        setSuccess(fulfilled);
      }
      setFailed(selected.filter((nft) => !fulfilled.includes(nft)));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  };

  const renderMainContent = () => (
    <Form onSubmit={handleSubmitBulkListNft(handleList)}>
      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-800 p-4 sm:p-2">
        <label className="relative ml-3 inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            value=""
            checked={useGlobalPrice}
            className="peer sr-only"
            onChange={(e) => setUseGlobalPrice(e.target.checked)}
          />
          <div className="peer h-7 w-12 rounded-full bg-black after:absolute after:top-[4px] after:left-[4px] after:h-5 after:w-5 after:rounded-full after:bg-gray-200  after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:bg-gradient-secondary"></div>
          <span className="ml-3 text-base text-gray-100">
            {t('bulkListing.globalPrice', { ns: 'profile' })}
          </span>
          <Tooltip content={t('bulkListing.globalPriceTooltip', { ns: 'profile' })}>
            <Icon.Info className="ml-2" />
          </Tooltip>
        </label>
        <Form.Input
          font
          className={clsx('h-12 sm:w-1/2')}
          icon={<Icon.Sol defaultColor={useGlobalPrice ? '#A8A8A8' : 'rgba(100,100,100,0.3)'} />}
          error={bulkListNftState.errors.globalBulkPrice}
          {...registerBulkListNft('globalBulkPrice', {
            required: useGlobalPrice,
            validate: (value) =>
              useGlobalPrice ? Boolean(+value) && Boolean(value.match(NUMBER_REGEX)?.length) : true,
          })}
          disabled={!useGlobalPrice}
        />
        <Form.Error message={bulkListNftState.errors.globalBulkPrice?.message} />
      </div>

      <div className="max-h-[25rem] overflow-auto">
        {selected.map((nft) => (
          <ListingItem
            key={nft.mintAddress}
            nft={nft}
            disabled={useGlobalPrice}
            bulkListNftState={bulkListNftState}
            registerBulkListNft={registerBulkListNft}
            success={success.includes(nft)}
            failed={failed.includes(nft)}
          />
        ))}
      </div>
      <hr className="border-b-none relative -left-[5%] w-[110%] border-t-[0.5px] border-gray-700/75" />
      <div className="grid w-full grid-cols-3 gap-2 py-6">
        <div className="">
          <p className="text-2xl text-gray-200">Total</p>
        </div>
        <div className="col-span-2 min-w-[4.5rem] justify-self-end">
          <div className="flex items-center gap-1">
            <Icon.Sol className="h-auto w-6" />
            <p className="text-2xl">{roundToPrecision(total, 2)}</p>
          </div>
          <p className="ml-7 text-sm text-gray-400">{solToUsdString(total)}</p>
        </div>
      </div>
      {listingBulk ? (
        <Button block loading background={ButtonBackground.Slate}>
          {t('bulkListing.pleaseWait', { ns: 'profile' })}
        </Button>
      ) : (
        <Button disabled={success.length === selected.length} block htmlType="submit">
          {t('bulkListing.listNow', { ns: 'profile', tokenCount: selected.length })}
        </Button>
      )}
    </Form>
  );

  return (
    <Modal title={t('bulkListing.title', { ns: 'profile' })} open={open} setOpen={setOpen}>
      {renderMainContent()}
    </Modal>
  );
}

export default BulkListModal;
