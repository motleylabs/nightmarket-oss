import clsx from 'clsx';
import { TFunction } from 'next-i18next';
import Image from 'next/image';

import infoIcon from '../../../public/images/leaderboard/info.svg';
import { HauoraFont } from '../../fonts';
import { LeaderboardInfoType } from '../../pages/leaderboard';

type LeaderboardInfoProps = {
  list: LeaderboardInfoType[];
};

export const LeaderboardInfo = ({ list }: LeaderboardInfoProps) => {
  return (
    <div className="grid sm:grid-cols-2 sm:grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 gap-4 w-full relative z-10 -mt-[180px] md:mt-[58px] lg:mt-[98px]">
      {list.map((item: LeaderboardInfoType, index) => (
        <div key={index} className="flex w-full bg-transparent h-[120px]">
          <div className="w-full bg-gray-850 group from-gray-850 relative flex flex-row overflow-hidden justify-center items-center h-full leaderbord-table-row px-[2px] pb-[2px] bg-gradient-to-b to-100% rounded-xl cursor-pointer backdrop-blur-sm z-20 from-10% via-primary-900/20 via-55% to-primary-800">
            <div className="w-full relative bg-gray-850/80 shadow-[0px_0px_1px_1px_#FEB0204F_inset] flex flex-row items-center h-full leaderbord-table-row font-bold rounded-xl pt-[15px] text-[14px] leading-[18px] px-4">
              <div className="flex w-full h-full text-white relative z-50">
                <div
                  className={clsx(
                    'flex flex-col clip-path-polygon-[0px_0px,_100%_0px,_99.58%_26.24%,_98.84%_94.96%,_1.16%_95.80%,_1px_26.24%] absolute -left-[18px] -top-4 -bottom-0 rounded-l-[10px] -right-[18px] bg-gradient-to-b from-gray-850 from-[50%] to-transparent'
                  )}
                >
                  <div className="flex flex-row justify-between items-center w-full p-4 bg-gray-800 group-hover:bg-[#222128]">
                    <div
                      className={clsx(
                        'text-base font-medium text-left text-gray-300',
                        `${HauoraFont.variable} font-sans`
                      )}
                    >
                      {item.title}
                    </div>

                    <Image src={infoIcon} height={20} width={20} alt="info-icon" />
                  </div>

                  <div className="text-white text-[32px] font-medium leading-10 px-4 pt-[10px]">
                    {(item.prefixSign ?? '') + item.value}
                  </div>
                </div>
              </div>
            </div>

            <div className="group-hover:animate-bladed-border opacity-0 absolute left-0 top-4 z-40 h-[40px] w-[2px] bg-white"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
