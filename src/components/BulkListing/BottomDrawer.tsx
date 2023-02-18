import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import config from '../../app.config';
import { AuctionHouse, Nft } from '../../graphql.types';
import { useBulkListContext } from '../../providers/BulkListProvider';
import Button, { ButtonBackground, ButtonColor } from '../Button';
import CheckBox from '../CheckBox';
import Img from '../Image';
import BulkListModal from './BulkListModal';

interface BulkListBottomDrawerProps {
  ownedNfts?: Nft[];
  auctionHouse: AuctionHouse;
  openDrawer: boolean;
}
function BulkListBottomDrawer({
  ownedNfts = [],
  auctionHouse,
  openDrawer,
}: BulkListBottomDrawerProps): JSX.Element {
  const { t } = useTranslation('profile');
  const { selected, setSelected } = useBulkListContext();
  const [listingOpen, setListingOpen] = useState(false);

  const unlistedNfts = useMemo(() => {
    return ownedNfts.filter(
      (nft) =>
        !nft.listings ||
        nft.listings.filter((listing) => listing.auctionHouse?.address === config.auctionHouse)
          .length === 0
    );
  }, [ownedNfts]);

  const handleMassSelect = () => {
    if (selected.length < unlistedNfts.length) setSelected(unlistedNfts);
    else setSelected([]);
  };

  const inView = selected.length > 0 || openDrawer;
  const position = inView ? 'translate-y-0' : 'translate-y-36';

  return (
    <div
      className={clsx('fixed bottom-0 z-10 w-full transition-transform duration-1000', position)}
    >
      <div className="flex w-full justify-center bg-gradient-to-t from-black to-transparent p-2">
        <div className="relative top-10 z-20 flex items-center justify-center gap-3 rounded-full bg-gray-900 p-2">
          <Button
            onClick={handleMassSelect}
            background={ButtonBackground.Gray}
            className="text-left"
          >
            <CheckBox
              label={t('bulkListing.selectUnlisted', {
                ns: 'profile',
                tokenCount: unlistedNfts.length,
              })}
              selected={selected.length >= unlistedNfts.length}
              onClick={handleMassSelect}
            />
          </Button>
          <Button onClick={() => setListingOpen(true)} className="text-sm">
            {t('bulkListing.listSelected', { ns: 'profile', tokenCount: selected.length })}
          </Button>
        </div>
      </div>
      <div className="h-12 w-full bg-black" />
      <div className="sm:px=[2.5] relative flex h-[4.5rem] items-center justify-between rounded-t-xl border-t border-gray-600/50 bg-gray-700 py-[1.5rem] px-[1.5rem]">
        <div className="absolute left-0 top-1 w-full ">
          <div className="m-auto h-1 w-10 rounded-full bg-gray-600" />
        </div>
        {selected.length ? (
          <>
            <div className="relative flex w-[60%] items-center gap-1 overflow-hidden">
              {selected.map((nft) => (
                <Img
                  key={nft.address}
                  fallbackSrc="/images/moon.svg"
                  src={nft.image}
                  alt={nft.name}
                  className="image-fit h-[1.5rem] w-[1.5rem] rounded-md"
                />
              ))}
              <div className="top-inherit absolute right-0 h-[1.5rem] w-1/6 bg-gradient-to-l from-gray-700 to-transparent" />
            </div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <p className="w-full text-center font-bold text-gray-500">
                {t('bulkListing.inCart', { ns: 'profile' })}
              </p>
              <p className="rounded-full bg-gradient-primary px-3 py-1">{selected.length}</p>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm">
              {t('bulkListing.noTokensInCart', { ns: 'profile' })}
            </p>
            <Img src="/images/moon.svg" className="w-[3rem] object-cover" alt="moon" />
          </>
        )}
      </div>

      <BulkListModal open={listingOpen} setOpen={setListingOpen} auctionHouse={auctionHouse} />
    </div>
  );
}

export default BulkListBottomDrawer;
