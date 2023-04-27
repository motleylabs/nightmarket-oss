import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { InView } from 'react-intersection-observer';
import useSWRInfinite from 'swr/infinite';

import { Activity } from '../../../components/Activity';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import { createApiTransport } from '../../../infrastructure/api';
import ProfileLayout from '../../../layouts/ProfileLayout';
import type { UserNfts, UserOffersData } from '../../../typings';
import Offer from './../../../components/Offer';

const PAGE_LIMIT = 24;

export async function getServerSideProps({ locale, params, req }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const api = createApiTransport(req);

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

  const { data, size, setSize, isValidating } = useSWRInfinite<UserOffersData>(getKey, {
    revalidateOnFocus: false,
  });

  const onShowMoreOffers = () => {
    setSize(size + 1);
  };

  const isLoading = !data && isValidating;
  const hasNextPage = Boolean(data?.every((d) => d.hasNextPage));
  const offers = data?.flatMap((d) => d.activities) ?? [];

  return (
    <div className="mt-20 flex flex-col gap-4 px-4 pt-4 md:px-8">
      {isLoading ? (
        <>
          <Activity.Skeleton />
          <Activity.Skeleton />
          <Activity.Skeleton />
          <Activity.Skeleton />
        </>
      ) : (
        <>
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
                  />
                }
                source={<Activity.Wallet buyer={offer.buyer} />}
              />
            );
          })}
          {hasNextPage && (
            <>
              <InView
                rootMargin="200px 0px"
                onChange={async (inView) => {
                  if (!inView) {
                    return;
                  }

                  onShowMoreOffers();
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
