import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

import { usePointContext } from '../providers/PointsProvider';
import { useWalletContext } from '../providers/WalletContextProvider';

function TicketPoints({ searchExpanded }: { searchExpanded: boolean }) {
  const { t } = useTranslation('common');
  const { push: routerPush, pathname } = useRouter();
  const { publicKey } = useWalletContext();
  const { points } = usePointContext();

  const [tooltipClass, setTooltipClass] = useState(
    'group-hover/ticket:animate-score-badge-tooltip group-hover/ticket:flex'
  );
  const [ticketClass, setTicketClass] = useState('');
  const [ticketImage, setTicketImage] = useState("bg-[url('/images/animated/ticket/1.svg')]");

  useEffect(() => {
    setTooltipClass('');
  }, [pathname]);

  return (
    <div
      onClick={() => {
        !isMobile && !pathname.includes('/leaderboard') && routerPush('/leaderboard');

        if (tooltipClass === '') {
          setTooltipClass('group-hover/ticket:animate-score-badge-tooltip group-hover/ticket:flex');
        }
      }}
      onMouseEnter={() => {
        setTicketClass('animate-ticket');
        setTimeout(() => setTicketImage("bg-[url('/images/animated/ticket/7.svg')]"), 150);
      }}
      onMouseLeave={() => {
        if (!searchExpanded) {
          setTicketClass('animate-ticket-reverse');
        }
        setTimeout(() => setTicketImage("bg-[url('/images/animated/ticket/1.svg')]"), 150);
      }}
      className={clsx(
        'group/ticket-points flex flex-row justify-center items-center w-[84px] h-full relative overflow-visible cursor-pointer bg-[#100F14] hover:bg-[#17161D] rounded-[50px] py-1 pl-3 pr-4',
        {
          '!hidden': searchExpanded,
        }
      )}
    >
      {/* TICKET  */}
      <div
        className={clsx(
          //   'group-hover/ticket-points:[&>*:first-child]:flex group-hover/ticket-points:[&>*:first-child]:animate-score-badge-tooltip',
          'group-hover/ticket-points:md:bg-[#17161D] !top-0 relative w-[42px] -mr-2 group/ticket',
          'h-full cursor-pointer bg-center bg-no-repeat overflow-visible !z-10 bg-contain !opacity-100',
          ticketClass,
          ticketImage
        )}
      >
        {/* Tooltip */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            !pathname.includes('/leaderboard') && routerPush('/leaderboard');
          }}
          className={clsx(
            tooltipClass,
            'md:group-hover/ticket-points:animate-score-badge-tooltip',
            'md:group-hover/ticket-points:flex group-hover/ticket-points:z-10 hidden',
            '-z-20 flex-col gap-x-0 top-[52px] justify-start items-start',
            'font-sans absolute -left-[150px] w-[229px] h-18 py-2 px-4 rounded-lg border-gray-750 border',
            'bg-[radial-gradient(128.13%_128.13%_at_50%_-28.13%,_rgba(247,_144,_76,_0.2)_0%,_rgba(247,_144,_76,_0)_59.72%)]',
            'bg-[#0A0A0A]',
            {
              'md:-left-[124px]': publicKey,
              'md:-left-[94px]': !publicKey,
            }
          )}
        >
          <div className="text-sm font-semibold text-white flex">
            {t('bulbTooltip.title', { ns: 'common' })}
          </div>
          <div className="text-sm font-medium text-gray-400 flex">
            {t('bulbTooltip.description', { ns: 'common' })}
          </div>
        </div>
      </div>

      {/* POINT */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          !pathname.includes('/leaderboard') && routerPush('/leaderboard');
        }}
        className={clsx(
          'relative text-white font-bold text-base ml-[10px]',
          searchExpanded && 'hidden'
        )}
      >
        {points.toFixed(0)}
      </div>
    </div>
  );
}

export default TicketPoints;
