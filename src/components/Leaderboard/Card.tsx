import clsx from 'clsx';
import { TFunction } from 'next-i18next';
import Image from 'next/image';
import React from 'react';

import gradientBorderIcon from '../../../public/images/leaderboard/bonuses/gradient-border.svg';
import bronzeMedalIcon from '../../../public/images/leaderboard/medals/bronze.svg';
import goldMedalIcon from '../../../public/images/leaderboard/medals/gold.svg';
import silverMedalIcon from '../../../public/images/leaderboard/medals/silver.svg';
import { Ranker } from '../../pages/leaderboard';
import { formatToLocaleNumber } from '../../utils/numbers';
import { hideTokenDetails } from '../../utils/tokens';

type LeaderboardCardProps = {
  index: number;
  ranker: Ranker;
  t: TFunction;
};

export const LeaderboardCard = ({ index, ranker, t }: LeaderboardCardProps) => {
  const leaderboardNS = 'leaderboard';

  const getMedalIconByRank = (rank: number) => {
    switch (rank) {
      case 1:
        return goldMedalIcon;
      case 2:
        return silverMedalIcon;
      case 3:
        return bronzeMedalIcon;
      default:
        return rank.toString();
    }
  };

  return (
    <>
      {/* MOBILE VIEW */}

      <div
        key={ranker.name + '-mobile'}
        className="flex md:hidden flex-col h-[100px] w-full bg-gray-850 rounded-xl"
      >
        <div className="relative flex flex-row justify-start items-center h-[38px] w-full bg-gray-800 rounded-t-xl overflow-hidden">
          <div
            className={clsx('flex justify-center max-w-[69px] items-center group', {
              'rank-polygon-container  clip-path-polygon-[0_0,_100%_0%,_63%_100%,_0%_100%] group-hover:clip-path-polygon-[0_0,_98%_0%,_65.5%_100%,_0%_100%] bg-[#D9D9D9]':
                ranker.position < 4,
            })}
          >
            {ranker.position < 4 ? (
              <div className="flex justify-center items-center rank-gold-container w-full h-full rounded-full  group-hover:scale-[115%] transform transition duration-400">
                <Image
                  src={getMedalIconByRank(ranker.position)}
                  className="h-full w-full object-cover"
                  alt="gold-medal"
                />
              </div>
            ) : (
              <span className="relative text-gray-200 font-semibold ml-[22px] text-base text-right">
                {ranker.position}
              </span>
            )}
          </div>

          <div
            className={clsx('flex flex-row items-center justify-start font-medium text-base', {
              'ml-[20px] text-white': ranker.position < 4,
              'ml-[55px] text-gray-200': ranker.position > 3,
            })}
          >
            {hideTokenDetails(ranker.name, true)}
          </div>
        </div>

        <div className="flex flex-row justify-between items-start pt-[8px] px-[10px] pb-2">
          <div className="flex-col gap-y-1 w-full hidden">
            <div className="flex text-sm text-gray-200 font-normal">
              {t('table.bonus', { ns: leaderboardNS })}
            </div>
            <div
              className={clsx(
                'flex justify-center items-center relative h-[28px] w-[43px] rounded-3xl',
                {
                  'bg-[#27262E] border border-[#4C4C4C] shadow-[0px_0px_16px_rgba(82.87,_82.87,_82.87,_0.50)]':
                    ranker.bonus < 5 && ranker.bonus > 1,
                  'bg-transparent border border-[#212027]': ranker.bonus === 1,
                  'bg-[#17161C] text-white/20': ranker.bonus === 0,
                  'text-white': ranker.bonus < 5,
                  'bg-[#523B17] text-primary-500 shadow-[0px_0px_20px_rgba(255,_174.85,_26.56,_0.50)]':
                    ranker.bonus > 4,
                }
              )}
            >
              {ranker.bonus > 4 && (
                <Image
                  src={gradientBorderIcon}
                  className="flex object-none w-[43px] h-[28px]"
                  alt="bonus-icon"
                />
              )}
              <div className="absolute mx-auto text-base">{ranker.bonus + 'x'}</div>
            </div>
          </div>

          <div className="flex flex-col gap-y-[6px] w-full ml-[39px]">
            <div className="flex text-sm text-gray-200 font-normal z-[80]">
              {t('table.tickerTickets', { ns: leaderboardNS })}
            </div>
            <div className="flex text-base text-white font-medium">
              {formatToLocaleNumber(ranker.points24Hours, 3)}
            </div>
          </div>

          <div className="flex flex-col gap-y-[6px] w-full">
            <div className="flex text-sm text-gray-200 font-normal">
              {t('table.totalTickets', { ns: leaderboardNS })}
            </div>
            <div className="flex text-base text-white font-medium">
              {formatToLocaleNumber(ranker.totalPoints, 3)}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div
        key={ranker.name}
        className={clsx(
          'w-full group relative hidden md:flex flex-row overflow-hidden justify-center items-center h-14 leaderbord-table-row py-[2px] pr-[2px] hover:bg-gradient-to-r to-100% rounded-xl cursor-pointer backdrop-blur-sm z-20',
          {
            'bg-gray-850': index % 2 === 0,
            'bg-gray-800': index % 2 !== 0,
            'from-gray-850 ': index % 2 === 0 && ranker.position > 3,
            'from-gray-800 ': index % 2 !== 0 && ranker.position > 3,
            'pl-[2px] -ml-[1px]': ranker.position < 4,
            'from-10% via-primary-900/20 via-55% to-primary-800/80 ': ranker.position > 3,
            'from-20% from-primary-900 to-primary-800 ': ranker.position < 4,
          }
        )}
      >
        <div
          className={clsx(
            'w-full relative group-hover:shadow-[0px_0px_8px_1px_#FEB0204F_inset] flex flex-row items-center h-full leaderbord-table-row font-bold rounded-xl py-[15px] text-[14px] leading-[18px] px-4',

            {
              'bg-gray-850': index % 2 === 0,
              'bg-gray-800': index % 2 !== 0,
            }
          )}
        >
          <div className="flex w-[31.2%] md:w-[20.25%] h-full text-white relative z-50">
            {ranker.position > 3 && (
              <div
                className={clsx(
                  'hidden group-hover:flex clip-path-polygon-[30%_0px,_99.73%_12.3%,_99.73%_85.85%,_70%_93%,_30%_100%,_0px_100%,_0px_0px] absolute -left-4 -top-4 -bottom-4 rounded-l-[10px] -right-[270%] bg-gradient-to-r from-[90%] to-transparent',
                  {
                    'from-gray-850': index % 2 === 0,
                    'from-gray-800': index % 2 !== 0,
                  }
                )}
              ></div>
            )}
          </div>

          <div className="flex w-[48.8%] md:w-[31.25%] text-gray-200 relative z-[80]">
            {hideTokenDetails(ranker.name, true)}
          </div>

          <div className="w-[32.9%] md:w-[19.87%] text-gray-200 ml-[2px] hidden">
            <div
              className={clsx(
                'flex justify-center items-center relative h-[28px] w-[43px] rounded-3xl',
                {
                  'bg-[#27262E] border border-gray-450 shadow-[0px_0px_16px_rgba(82.87,_82.87,_82.87,_0.50)]':
                    ranker.bonus < 5 && ranker.bonus > 1,
                  'bg-transparent border-[#212027] border': ranker.bonus === 1,
                  'text-white/20': ranker.bonus === 0,
                  'bg-gray-800': index % 2 === 0 && ranker.bonus === 0,
                  'bg-gray-850': index % 2 !== 0 && ranker.bonus === 0,
                  'text-white': ranker.bonus < 5,
                  'bg-[#523B17] text-primary-500 shadow-[0px_0px_20px_rgba(255,_174.85,_26.56,_0.50)]':
                    ranker.bonus > 4,
                }
              )}
            >
              {ranker.bonus > 4 && (
                <Image
                  src={gradientBorderIcon}
                  className="flex object-none w-[43px] h-[28px]"
                  alt="bonus-icon"
                />
              )}
              <div className="absolute mx-auto">{ranker.bonus + 'x'}</div>
            </div>
          </div>

          <div className="hidden md:flex w-[25.75%] text-gray-200 z-[80]">
            {formatToLocaleNumber(ranker.points24Hours, 3)}
          </div>

          <div className="hidden md:flex w-[18.25%] text-gray-200 ml-2">
            {formatToLocaleNumber(ranker.totalPoints, 3)}
          </div>

          <div
            className={clsx(
              'flex justify-center max-w-[69px] w-[28.3%] items-center absolute z-[80] -left-[2px] -top-[3px] -bottom-[3px] rounded-s-xl  group-hover:-top-[0px] group-hover:-left-[2px] group-hover:-bottom-[1px]',
              {
                'rank-polygon-container  clip-path-polygon-[0_0,_100%_0%,_63%_100%,_0%_100%] group-hover:clip-path-polygon-[0_0,_98%_0%,_65.5%_100%,_0%_100%] bg-[#D9D9D9]':
                  ranker.position < 4,
              }
            )}
          >
            {ranker.position < 4 ? (
              <div className="flex justify-center items-center relative rank-gold-container w-full h-full rounded-full  group-hover:scale-[115%] transform transition duration-400">
                <Image
                  src={getMedalIconByRank(ranker.position)}
                  className="h-full w-full object-cover"
                  alt="gold-medal"
                />
              </div>
            ) : (
              <span className="relative flex z-[80] text-white pr-2">{ranker.position}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
