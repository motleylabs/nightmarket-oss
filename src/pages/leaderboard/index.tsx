import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import LeaderboardBanner from '../../components/Leaderboard/Banner';
import { LeaderboardInfo } from '../../components/Leaderboard/Info';
import LeaderboardModal from '../../components/Leaderboard/Modal';
import LeaderboardTable from '../../components/Leaderboard/Table';
import { useWalletContext } from '../../providers/WalletContextProvider';
import { formatToLocaleNumber } from '../../utils/numbers';

export interface Ranker {
  position: number;
  name: string;
  bonus: number;
  points24Hours: number;
  totalPoints: number;
}

export interface LeaderboardInfoType {
  title: string;
  value: string;
  prefixSign?: string;
}

export interface LeaderBoardPointResponseType {
  wallet: string;
  points: number;
  points24Hours: number;
}

interface LeaderbordResponseType {
  wallet: string;
  wallet_points: LeaderBoardPointResponseType[];
}

export default function LeaderboardPage() {
  const { address } = useWalletContext();
  const { t } = useTranslation(['leaderboard', 'common']);
  const leaderboardNS = 'leaderboard';
  const commonNS = 'common';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  const [earnedPointsIn24h, setEarnedPointsIn24h] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [participantsIn24h, setParticipantsIn24h] = useState(0);

  const leaderboardInfoList: LeaderboardInfoType[] = [
    {
      title: t('info.totalEarnedPoints', { ns: leaderboardNS }),
      value: formatToLocaleNumber(totalEarnedPoints, 3),
    },
    {
      title: t('info.earnedPointsIn24h', { ns: leaderboardNS }),
      value: formatToLocaleNumber(earnedPointsIn24h, 3),
    },
    {
      title: t('info.totalParticipants', { ns: leaderboardNS }),
      value: formatToLocaleNumber(totalParticipants, 3),
    },
    {
      title: t('info.participantsIn24h', { ns: leaderboardNS }),
      value: formatToLocaleNumber(participantsIn24h, 3),
      prefixSign: participantsIn24h > 0 ? '+' : '',
    },
  ];

  const getKey = (path: string) => {
    return `${process.env.NEXT_PUBLIC_LEADERBOARD_ENDPOINT}/${path}/${
      address ?? '11111111111111111111111111111111'
    }`;
  };

  const { data: userPointsData } = useSWRInfinite<LeaderBoardPointResponseType>(() =>
    getKey('points')
  );

  const {
    data,
    isValidating,
    mutate,
    isLoading: isDataLoading,
  } = useSWRInfinite<LeaderbordResponseType>(() => getKey('leaderboard'));

  const [rankers, setRankers] = useState<Ranker[]>([]);
  const [currentUser, setCurrentUser] = useState<Ranker>();

  const isLoading = useMemo(
    () => (!data && isValidating) || isDataLoading,
    [data, isValidating, isDataLoading]
  );

  const currentRanker: Ranker | undefined = useMemo(() => {
    return userPointsData
      ? {
          name: userPointsData[0].wallet,
          totalPoints: userPointsData[0].points,
          bonus: 0,
          points24Hours: 0,
          position: 0,
        }
      : undefined;
  }, [userPointsData]);

  useEffect(() => {
    if (data) {
      const tempRankers: Ranker[] = [];
      let sumOfTotalEarnedPoints = 0;
      let sumOfEarnedPointsIn24h = 0;
      let sumOfParticipantsIn24h = 0;

      setTotalParticipants(data[0]?.wallet_points.length);

      data[0]?.wallet_points?.forEach((value: LeaderBoardPointResponseType, index) => {
        sumOfTotalEarnedPoints += value.points;
        sumOfEarnedPointsIn24h += value.points24Hours;

        if (value.points24Hours > 0) sumOfParticipantsIn24h++;

        // Adds first 500 rankers into leaderboard
        if (index < 500) {
          const ranker: Ranker = {
            position: index + 1,
            bonus: 0,
            name: value.wallet,
            points24Hours: value.points24Hours,
            totalPoints: value.points,
          };

          tempRankers.push(ranker);
        }

        // Finds current user info
        if (value.wallet === address) {
          const ranker: Ranker = {
            position: index + 1,
            bonus: 0,
            name: value.wallet,
            points24Hours: value.points24Hours,
            totalPoints: value.points,
          };

          setCurrentUser(ranker);
        }
      });

      setEarnedPointsIn24h(sumOfEarnedPointsIn24h);
      setTotalEarnedPoints(sumOfTotalEarnedPoints);
      setParticipantsIn24h(sumOfParticipantsIn24h);
      setRankers([...tempRankers]);
    }
  }, [data]);

  useEffect(() => {
    mutate();
  }, [address]);

  return (
    <main className="-mb-[64px] min-h-[calc(100vh_-_120px)] md:-mb-[120px] flex justify-center items-center overflow-x-hidden">
      <Head>
        <title>{`${t('metadata.title', { ns: leaderboardNS })} | ${t('header.title', {
          ns: commonNS,
        })}`}</title>
        <meta name="description" content={t('metadata.description', { ns: leaderboardNS })} />
      </Head>
      <div className="flex flex-col w-full px-4 sm:px-8 overflow-x-hidden max-w-[1064px]">
        <LeaderboardBanner t={t} openHowToEarnModal={() => setIsModalOpen(true)} />
        {/* <LeaderboardInfo list={leaderboardInfoList} /> */}
        <LeaderboardTable
          t={t}
          data={rankers}
          loading={isLoading}
          currentUser={currentUser ?? currentRanker}
        />
      </div>
      {isModalOpen && <LeaderboardModal open={isModalOpen} setOpen={setIsModalOpen} t={t} />}
    </main>
  );
}

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['leaderboard', 'common']);

  return {
    props: {
      ...i18n,
    },
  };
}
