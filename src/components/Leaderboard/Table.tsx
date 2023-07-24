import clsx from 'clsx';
import { TFunction } from 'next-i18next';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import gradientBorderIcon from '../../../public/images/leaderboard/bonuses/gradient-border.svg';
import { Ranker } from '../../pages/leaderboard';
import { useWalletContext } from '../../providers/WalletContextProvider';
import { formatToLocaleNumber } from '../../utils/numbers';
import { hideTokenDetails } from '../../utils/tokens';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from '../Button';
import { SortingArrow } from '../SortingArrow';
import { LeaderboardCard } from './Card';

enum SortType {
  Position = 'position',
  Name = 'name',
  Bonus = 'bonus',
  Points24Hours = 'points24Hours',
  TotalPoints = 'totalPoints',
}

type LeaderboardTableProps = {
  data: Ranker[] | undefined;
  currentUser: Ranker | undefined;
  loading: boolean;
  hasMore?: boolean;
  className?: string;
  t: TFunction;
};

export default function LeaderboardTable({
  data,
  loading,
  className,
  currentUser,
  t,
}: LeaderboardTableProps) {
  const { connected: isConnected } = useWalletContext();
  const [tableLimit, setTableLimit] = useState<number>(50);
  const [sortBy, setSortBy] = useState<string>(SortType.Position);
  const [orderBy, setOrderBy] = useState<string>('asc');
  const [rankerList, setRankerList] = useState<Ranker[] | undefined>(data);

  const leaderboardNS = 'leaderboard';

  useEffect(() => {
    setRankerList(data);
  }, [data]);

  const sort = (field: SortType) => {
    setRankerList(data);
    setSortBy(field);
    setOrderBy(orderBy === 'asc' ? 'desc' : 'asc');

    if (rankerList) {
      setRankerList([
        ...rankerList.sort((a: Ranker, b: Ranker) => {
          if (a[field] > b[field]) return orderBy !== 'asc' ? 1 : -1;
          else if (a[field] < b[field]) return orderBy === 'asc' ? 1 : -1;
          else return 0;
        }),
      ]);
    }
  };

  return (
    <div className={clsx('w-full mt-6 md:mt-12 mx-auto relative z-10', className)}>
      <div className="flex-col w-full flex">
        <TableHeader sort={sort} sortBy={sortBy} orderBy={orderBy} t={t} />

        {!!data && data.length > 0 ? (
          <div className="flex flex-col gap-y-2 md:gap-y-3 md:mt-[6px] md:mb-[72px]">
            {isConnected && currentUser && (
              <YouCard
                index={currentUser.name + data.length}
                youText={t('table.you', { ns: leaderboardNS })}
                currentUser={{
                  ...currentUser,
                  position:
                    currentUser.position === 0
                      ? (rankerList?.length ?? 0) + 1
                      : currentUser.position,
                }}
              />
            )}
            {rankerList?.map(
              (ranker: Ranker, index: number) =>
                index < tableLimit && (
                  <LeaderboardCard key={index} t={t} index={index} ranker={ranker} />
                )
            )}

            {tableLimit < (rankerList?.length ?? 0) && (
              <Button
                className="w-full h-[32px] max-w-[190px] text-sm mt-5 mx-auto mb-16 md:mb-0"
                background={ButtonBackground.Black}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
                onClick={() => {
                  setTableLimit(tableLimit + 50);
                }}
              >
                {t('table.loadMore', { ns: leaderboardNS })}
              </Button>
            )}
          </div>
        ) : (
          loading && (
            <div className="flex flex-col gap-y-2 md:gap-y-3 md:mt-[6px] md:mb-[72px] w-full">
              <div className="animate-pulse w-full relative flex flex-row items-center h-14 leaderbord-table-row font-bold rounded-xl py-[15px] text-[14px] leading-[18px] px-4 bg-gray-850" />
              <div className="animate-pulse w-full relative flex flex-row items-center h-14 leaderbord-table-row font-bold rounded-xl py-[15px] text-[14px] leading-[18px] px-4 bg-gray-800" />
              <div className="animate-pulse w-full relative flex flex-row items-center h-14 leaderbord-table-row font-bold rounded-xl py-[15px] text-[14px] leading-[18px] px-4 bg-gray-850" />
              <div className="animate-pulse w-full relative flex flex-row items-center h-14 leaderbord-table-row font-bold rounded-xl py-[15px] text-[14px] leading-[18px] px-4 bg-gray-800" />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function TableHeader({
  sort,
  sortBy,
  orderBy,
  t,
}: {
  sort: (field: SortType) => void;
  sortBy: string;
  orderBy: string;
  t: TFunction;
}) {
  const leaderboardNS = 'leaderboard';

  return (
    <div className="hidden w-full md:flex flex-row px-4">
      <div
        onClick={() => sort(SortType.Position)}
        className="flex text-[12px] text-gray-450 text-left cursor-pointer w-[31.2%] md:w-[20.25%]"
      >
        <span className="flex items-center">
          {t('table.position', { ns: leaderboardNS })} &nbsp;
          <SortingArrow sortBy={sortBy ?? ''} field={SortType.Position} orderBy={orderBy ?? ''} />
        </span>
      </div>
      <div
        onClick={() => sort(SortType.Name)}
        className="flex text-[12px] text-gray-450 text-left cursor-pointer w-[48.8%] md:w-[31.25%]"
      >
        <span className="flex items-center">
          {t('table.name', { ns: leaderboardNS })} &nbsp;
          <SortingArrow sortBy={sortBy ?? ''} field={SortType.Name} orderBy={orderBy ?? ''} />
        </span>
      </div>
      <div
        onClick={() => sort(SortType.Bonus)}
        className="text-[12px] text-gray-450 text-left cursor-pointer w-[32.9%] md:w-[19.87%] hidden"
      >
        <span className="flex items-center">
          {t('table.bonus', { ns: leaderboardNS })} &nbsp;
          <SortingArrow sortBy={sortBy ?? ''} field={SortType.Bonus} orderBy={orderBy ?? ''} />
        </span>
      </div>
      <div
        onClick={() => sort(SortType.Points24Hours)}
        className="hidden md:flex text-[12px] text-gray-450 text-left cursor-pointer w-[25.75%]"
      >
        <span className="flex items-center">
          {t('table.tickerTickets', { ns: leaderboardNS })} &nbsp;
          <SortingArrow
            sortBy={sortBy ?? ''}
            field={SortType.Points24Hours}
            orderBy={orderBy ?? ''}
          />
        </span>
      </div>
      <div
        onClick={() => sort(SortType.TotalPoints)}
        className="hidden md:flex text-[12px] text-gray-450 text-left cursor-pointer w-[18.25%]"
      >
        <span className="flex items-center">
          {t('table.totalTickets', { ns: leaderboardNS })} &nbsp;
          <SortingArrow
            sortBy={sortBy ?? ''}
            field={SortType.TotalPoints}
            orderBy={orderBy ?? ''}
          />
        </span>
      </div>
    </div>
  );
}

function YouCard({
  currentUser,
  index,
  youText,
}: {
  currentUser: Ranker;
  index: number | string;
  youText: string;
}) {
  return (
    <>
      {/* MOBILE VIEW */}
      <div
        key={index + '-mobile'}
        className="flex flex-col h-[100px] w-full bg-gray-850 rounded-xl md:hidden"
      >
        <div className="flex flex-row justify-start items-center h-[38px] w-full bg-gray-800 py-[6px] pr-2 pl-4 rounded-t-xl">
          <div className="text-white font-semibold mr-5 text-base">{currentUser.position}</div>

          <div className="flex flex-row items-center justify-start text-white font-medium text-base">
            <span className="text-primary-100 pr-1">
              <div className="w-[53px] h-[28px] px-[12px] py-[2px] bg-gradient-to-br from-orange-600 to-amber-500 rounded-3xl shadow-[0px_0px_21px_0px_rgba(240,_138,_7,_0.58)] justify-start items-start gap-[10px] inline-flex">
                <div className="text-white text-[16px] font-bold leading-normal">{youText}</div>
              </div>
            </span>
            {'(' + hideTokenDetails(currentUser.name, true) + ')'}
          </div>
        </div>

        <div className="flex flex-row justify-between items-start pt-[8px] px-[10px] pb-2 ">
          <div className="flex-col gap-y-1 w-full hidden">
            <div className="flex text-sm text-gray-200 font-normal">Bonus</div>
            <div
              className={clsx(
                'flex justify-center items-center relative h-[28px] w-[43px] rounded-3xl',
                {
                  'bg-[#27262E] border border-[#4C4C4C] shadow-[0px_0px_16px_rgba(82.87,_82.87,_82.87,_0.50)]':
                    currentUser.bonus < 5 && currentUser.bonus > 1,
                  'bg-transparent border border-[#212027]': currentUser.bonus === 1,
                  'bg-[#17161C] text-white/20': currentUser.bonus === 0,
                  'text-white': currentUser.bonus < 5,
                  'bg-[#523B17] text-primary-500 shadow-[0px_0px_20px_rgba(255,_174.85,_26.56,_0.50)]':
                    currentUser.bonus > 4,
                }
              )}
            >
              {currentUser.bonus > 4 && (
                <Image
                  src={gradientBorderIcon}
                  className="flex object-none w-[43px] h-[28px]"
                  alt="bonus-icon"
                />
              )}
              <div className="absolute mx-auto">{currentUser.bonus + 'x'}</div>
            </div>
          </div>

          <div className="flex flex-col gap-y-1 w-full ml-[39px]">
            <div className="flex text-sm text-gray-200 font-normal">24h Points</div>
            <div className="flex text-base text-white font-medium">
              {formatToLocaleNumber(currentUser.points24Hours, 3)}
            </div>
          </div>

          <div className="flex flex-col gap-y-1 w-full">
            <div className="flex text-sm text-gray-200 font-normal">Total Points</div>
            <div className="flex text-base text-white font-medium">
              {' '}
              {formatToLocaleNumber(currentUser.totalPoints, 3)}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div
        key={index + '-desktop'}
        className="hidden md:flex p-[2px] bg-[#3A393E] hover:bg-gradient-to-r hover:from-[#3A393E] hover:from-[20%] hover:via-primary-900 hover:to-primary-800 rounded-xl"
      >
        <div className="w-full relative flex flex-row items-center h-12 leaderbord-table-row font-bold rounded-xl py-[15px] text-[14px] leading-[18px] px-4 bg-gray-850">
          <div className="flex relative z-20 w-[31.2%] md:w-[20.25%] text-white">
            {currentUser.position}
          </div>

          <div className="flex flex-row items-center justify-start w-[48.8%] md:w-[31.25%] text-white/20">
            <span className="text-primary-100 pr-1">
              <div className="w-[53px] h-[28px] px-[12px] py-[2px] bg-gradient-to-br from-orange-600 to-amber-500 rounded-3xl shadow-[0px_0px_21px_0px_rgba(240,_138,_7,_0.58)] justify-start items-start gap-[10px] inline-flex">
                <div className="text-white text-[16px] font-bold leading-normal">{youText}</div>
              </div>
            </span>
            {'(' + hideTokenDetails(currentUser.name, true) + ')'}
          </div>

          <div className="w-[32.9%] md:w-[19.87%] text-gray-200 ml-[2px] hidden">
            <div
              className={clsx(
                'flex justify-center items-center relative h-[28px] w-[43px] rounded-3xl',
                {
                  'bg-[#27262E] border border-[#4C4C4C] shadow-[0px_0px_16px_rgba(82.87,_82.87,_82.87,_0.50)]':
                    currentUser.bonus < 5 && currentUser.bonus > 1,
                  'bg-transparent border border-[#212027]': currentUser.bonus === 1,
                  'bg-[#17161C] text-white/20': currentUser.bonus === 0,
                  'text-white': currentUser.bonus < 5,
                  'bg-[#523B17] text-primary-500 shadow-[0px_0px_20px_rgba(255,_174.85,_26.56,_0.50)]':
                    currentUser.bonus > 4,
                }
              )}
            >
              {currentUser.bonus > 4 && (
                <Image
                  src={gradientBorderIcon}
                  className="flex object-none w-[43px] h-[28px]"
                  alt="bonus-icon"
                />
              )}
              <div className="absolute mx-auto">{currentUser.bonus + 'x'}</div>
            </div>
          </div>

          <div className="hidden md:flex w-[25.75%] text-gray-200">
            {formatToLocaleNumber(currentUser.points24Hours, 3)}
          </div>
          <div className="hidden md:flex w-[18.25%] text-gray-200 ml-2">
            {formatToLocaleNumber(currentUser.totalPoints, 3)}
          </div>
        </div>
      </div>
    </>
  );
}
