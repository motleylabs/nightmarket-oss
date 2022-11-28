import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { WalletProfileQuery, ProfileOffersQuery } from './../../../queries/profile.graphql';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AuctionHouse, OfferType, Wallet } from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import { Activity, ActivityType } from '../../../components/Activity';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { InView } from 'react-intersection-observer';
import ProfileLayout from '../../../layouts/ProfileLayout';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import Select from '../../../components/Select';
import { useWallet } from '@solana/wallet-adapter-react';
import Button, {
  ButtonSize,
  ButtonBackground,
  ButtonBorder,
  ButtonColor,
} from '../../../components/Button';
import { Offerable } from '../../../components/Offerable';
import config from '../../../app.config';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const {
    data: { wallet, auctionHouse },
  } = await client.query({
    query: WalletProfileQuery,
    variables: {
      address: params?.address,
      auctionHouse: config.auctionHouse,
    },
  });

  if (wallet === null || auctionHouse === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      auctionHouse,
      ...i18n,
    },
  };
}

interface ProfileOffersData {
  wallet: Wallet;
}

interface ProfileOffersVariables {
  offset: number;
  limit: number;
  address: string;
  offerType: OfferType | null;
}

enum OffersFilter {
  All = 'ALL',
  Received = 'OFFER_RECEIVED',
  Placed = 'OFFER_PLACED',
}

interface ProfileOffersForm {
  type: string;
}

export default function ProfileOffers(): JSX.Element {
  const { t } = useTranslation(['common', 'profile']);
  const { publicKey } = useWallet();

  const activityFilterOptions = [
    { label: t('profile:offersFilter.allOffers'), value: OffersFilter.All },
    { label: t('profile:offersFilter.offersReceived'), value: OffersFilter.Received },
    { label: t('profile:offersFilter.offersPlaced'), value: OffersFilter.Placed },
  ];

  const { watch, control } = useForm<ProfileOffersForm>({
    defaultValues: {
      type: activityFilterOptions[0].value,
    },
  });
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);

  const offersQuery = useQuery<ProfileOffersData, ProfileOffersVariables>(ProfileOffersQuery, {
    variables: {
      offset: 0,
      limit: 24,
      address: router.query.address as string,
      offerType: null,
    },
  });

  useEffect(() => {
    const subscription = watch(({ type }) => {
      let offerType = null;
      switch (type) {
        case OffersFilter.Placed:
          offerType = OfferType.OfferPlaced;
          break;
        case OffersFilter.Received:
          offerType = OfferType.OfferReceived;
          break;
      }

      let variables: ProfileOffersVariables = {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        offerType: offerType,
      };

      offersQuery.refetch(variables).then(({ data: { wallet } }) => {
        setHasMore(wallet.offers.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, offersQuery]);

  return (
    <>
      <Toolbar>
        <div className="hidden md:block" />
        <div className="col-span-2 md:col-span-1">
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onChange={onChange}
                options={activityFilterOptions}
                className="w-48"
              />
            )}
          />
        </div>
      </Toolbar>
      <div className="mt-4 flex flex-col gap-4 px-4 pt-4 md:px-8">
        {offersQuery.loading ? (
          <>
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
          </>
        ) : (
          <>
            <Offerable connected={Boolean(publicKey)}>
              {({ makeOffer }) =>
                offersQuery.data?.wallet.offers.map((offer) => {
                  return (
                    <Activity
                      avatar={
                        <Link
                          className="cursor-pointer transition hover:scale-[1.02]"
                          href={`/nfts/${offer.nft?.mintAddress}/details`}
                        >
                          <Avatar src={offer.nft?.image as string} size={AvatarSize.Standard} />
                        </Link>
                      }
                      type={ActivityType.Offer}
                      key={offer.id}
                      meta={
                        <Activity.Meta
                          title={<Activity.Tag />}
                          marketplace={offer.nftMarketplace}
                          source={<Activity.Wallet wallet={offer.buyerWallet} />}
                        />
                      }
                      actionButton={
                        <>
                          {publicKey && offer.buyerWallet.address === publicKey.toBase58() && (
                            <Link href={`/nfts/${offer.nft?.mintAddress}/details`}>
                              <Button
                                background={ButtonBackground.Slate}
                                border={ButtonBorder.Gray}
                                color={ButtonColor.Gray}
                                size={ButtonSize.Small}
                                onClick={() => {}}
                              >
                                {t('profile:update')}
                              </Button>
                            </Link>
                          )}
                          {publicKey && offer.nft?.owner?.address === publicKey.toBase58() && (
                            <Link href={`/nfts/${offer.nft?.mintAddress}/details`}>
                              <Button
                                background={ButtonBackground.Slate}
                                border={ButtonBorder.Gradient}
                                color={ButtonColor.Gradient}
                                size={ButtonSize.Small}
                                onClick={() => {}}
                              >
                                {t('profile:accept')}
                              </Button>
                            </Link>
                          )}
                        </>
                      }
                    >
                      <Activity.Price amount={offer.solPrice} />
                      <Activity.Timestamp timeSince={offer.timeSince} />
                    </Activity>
                  );
                })
              }
            </Offerable>
            {hasMore && (
              <>
                <InView
                  onChange={async (inView) => {
                    if (!inView) {
                      return;
                    }

                    const {
                      data: { wallet },
                    } = await offersQuery.fetchMore({
                      variables: {
                        offset: offersQuery.data?.wallet.offers.length,
                      },
                    });

                    setHasMore(wallet.offers.length > 0);
                  }}
                >
                  <Activity.Skeleton />
                </InView>
                <Activity.Skeleton />
                <Activity.Skeleton />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

interface ProfileActivityLayoutProps {
  children: ReactElement;
  wallet: Wallet;
  auctionHouse: AuctionHouse;
}

ProfileOffers.getLayout = function ProfileActivityLayout({
  children,
  wallet,
  auctionHouse,
}: ProfileActivityLayoutProps): JSX.Element {
  return (
    <ProfileLayout wallet={wallet} auctionHouse={auctionHouse}>
      {children}
    </ProfileLayout>
  );
};
