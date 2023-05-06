/* eslint-disable react/jsx-no-useless-fragment */
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useSWRInfinite from 'swr/infinite';

import { Activity } from '../../../components/Activity';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import { api } from '../../../infrastructure/api';
import ProfileLayout from '../../../layouts/ProfileLayout';
import type { UserNfts, UserOffersData } from '../../../typings';
import Offer from './../../../components/Offer';

const PAGE_LIMIT = 24;

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const { data } = await api.get<UserNfts>(`/users/nfts?address=${params?.address}`);

  if (data == null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...data,
      ...i18n,
    },
  };
}

export default function ProfileOffers() {
  const { query } = useRouter();

  const getKey = (pageIndex: number, previousPageData: UserOffersData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    return `/users/offers?address=${query.address}&limit=${PAGE_LIMIT}&offset=${
      pageIndex * PAGE_LIMIT
    }`;
  };

  const { data, setSize, isValidating } = useSWRInfinite<UserOffersData>(getKey, {
    revalidateOnFocus: false,
  });

  const onShowMoreOffers = () => {
    setSize((oldSize) => oldSize + 1);
  };

  const isLoading = useMemo(() => !data && isValidating, [data, isValidating]);
  const hasNextPage = useMemo(() => Boolean(data?.every((d) => d.hasNextPage)), [data]);
  const offers = useMemo(() => data?.flatMap((d) => d.activities) ?? [], [data]);

  return (
    <>
      { offers.length === 0 ?
        isLoading &&
          <div className="mt-24 flex flex-col gap-4 px-4">
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
          </div>
        : 
          <InfiniteScroll
            dataLength={offers.length}
            next={onShowMoreOffers}
            hasMore={hasNextPage}
            loader={
              <>
                <Activity.Skeleton />
                <Activity.Skeleton />
                <Activity.Skeleton />
                <Activity.Skeleton />
              </>
            }
            className="mt-20 flex flex-col gap-4 px-4 pt-4 md:px-8"
          >
            {offers.map((offer, i) => {
              return (
                <Offer
                  nft={null}
                  avatar={
                    <Link
                      className="cursor-pointer transition hover:scale-[1.02]"
                      href={`/nfts/${offer.mint}`}
                    >
                      <Avatar src={offer.image as string} size={AvatarSize.Standard} />
                    </Link>
                  }
                  offer={offer}
                  key={`${offer.mint}-${i}`}
                  onAccept={() => null}
                  onCancel={() => null}
                  meta={
                    <Activity.Meta
                      title={<Activity.Tag />}
                      marketplaceAddress={offer.martketplaceProgramAddress}
                      auctionHouseAddress={offer.auctionHouseAddress}
                    />
                  }
                  source={<Activity.Wallet buyer={offer.buyer} />}
                />
              );
            })}
          </InfiniteScroll>
      }
    </>
  );
}

interface ProfileActivityLayoutProps {
  children: ReactElement;
  nfts: UserNfts['nfts'];
  collections: UserNfts['collections'];
}

ProfileOffers.getLayout = function ProfileActivityLayout({
  children,
  ...restProps
}: ProfileActivityLayoutProps): JSX.Element {
  return <ProfileLayout {...restProps}>{children}</ProfileLayout>;
};
