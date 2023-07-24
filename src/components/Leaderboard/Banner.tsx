import clsx from 'clsx';
import { TFunction } from 'next-i18next';
import Image from 'next/image';
import React, { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';

import bannerIllustrationImage from '../../../public/images/leaderboard/banner-illustration.svg';
import {
  CollectionSort,
  CollectionTrend,
  CollectionsTrendsData,
  OrderDirection,
} from '../../typings/index.d';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from '../Button';

type LeaderboardBannerProps = {
  t: TFunction;
  openHowToEarnModal: () => void;
};

export default function LeaderboardBanner({ t }: LeaderboardBannerProps) {
  const leaderboardNS = 'leaderboard';

  const DEFAULT_SORT: CollectionSort = CollectionSort.Volume;
  const DEFAULT_ORDER: OrderDirection = OrderDirection.Desc;
  const PAGE_LIMIT = 10;

  const getTrendsKey = (pageIndex: number, previousPageData: CollectionsTrendsData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    const query = `sort_by=${DEFAULT_SORT}&order=${DEFAULT_ORDER}&limit=${PAGE_LIMIT}&offset=${
      pageIndex * PAGE_LIMIT
    }`;

    return `/collections/trend?${query}`;
  };

  const { data: collectionsTrendsData } = useSWRInfinite<CollectionsTrendsData>(getTrendsKey, {
    revalidateOnFocus: false,
  });

  const trends: CollectionTrend[] = useMemo(
    () =>
      collectionsTrendsData ? collectionsTrendsData.flatMap((pageData) => pageData.trends) : [],
    [collectionsTrendsData]
  );

  return (
    <div className="flex relative items-center md:flex-row w-full mx-auto md:justify-start md:items-start lg:items-start md:mt-[98px] mt-12 md:gap-x-4 lg:gap-x-6">
      <div className="flex relative z-10 flex-col justify-start md:items-start max-w-[209px] md:max-w-[408px] text-start md:text-start lg:text-start">
        <div className="leading-8 md:text-[40px] text-[24px] font-semibold text-white">
          {t('banner.leaderboard', { ns: leaderboardNS })}
        </div>

        <div className="text-sm md:font-semibold font-normal text-white/60 mt-3 mb-6 text-left md:pr-6 whitespace-pre-line sm:w-full w-[90%] leading-[18px]">
          <div>{`${t('banner.description.1', { ns: leaderboardNS })} `}</div>
          {`${t('banner.description.2', { ns: leaderboardNS })} `}
          {/* <span onClick={openHowToEarnModal} className="text-primary-500 underline cursor-pointer">
            {`${t('banner.howToEarn', {
              ns: leaderboardNS,
            })}`}
          </span> */}
        </div>

        <Button
          className="w-full h-[32px] max-w-[190px] text-sm"
          background={ButtonBackground.Black}
          border={ButtonBorder.Gradient}
          color={ButtonColor.Gradient}
          onClick={() => {
            const index = Math.floor(Math.random() * trends.length);
            if (trends[index]?.collection?.slug)
              window.location.href = `/collections/${trends[index].collection?.slug}`;
            else window.location.href = `/collections`;
          }}
        >
          {t('exploreNightMarket', { ns: leaderboardNS })}
        </Button>
      </div>

      <Image
        src={bannerIllustrationImage}
        // fill
        className={clsx(
          'w-full sm:w-screen object-cover md:object-fill sm:h-screen absolute sm:-top-[96px] sm:right-0 -top-[30%] max-sm:left-[30%]',
          'max-w-[360px] max-h-[368px] md:max-w-[460px] md:max-h-[468px] lg:max-w-[577px] lg:max-h-[532px] xl:max-w-[1022px] xl:max-h-[636px]',
          'md:-top-[160px] md:-right-[70px] lg:-top-[160px] lg:-right-[50px] xl:-top-[220px] xl:-right-[220px] z-00'
        )}
        alt="leaderbord-banner"
      />
    </div>
  );
}
