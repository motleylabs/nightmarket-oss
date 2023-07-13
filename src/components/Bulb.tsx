import clsx from 'clsx';
import { TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';

function Bulb({ t, searchExpanded }: { t: TFunction; searchExpanded: boolean }) {
  const [bulbAfterAnimation, setBulbAfterAnimation] = useState('');
  const [bulbImg, setBulbImg] = useState("bg-[url('/images/animated/gem/1.svg')]");

  useEffect(() => {
    setBulbAfterAnimation('');
  }, [searchExpanded]);

  return (
    <div
      onMouseEnter={() => setBulbImg("bg-[url('/images/animated/bulb/6.svg')]")}
      onMouseLeave={() => {
        if (!searchExpanded) setBulbAfterAnimation('animate-bulb-after');
        setBulbImg("bg-[url('/images/animated/gem/1.svg')]");
      }}
      className={clsx(
        "group  relative w-[42px] ml-1 -mr-2 bg-[length:auto_50px] md:bg-[length:auto_60px] h-full cursor-pointer hover:animate-bulb hover:bg-[url('/images/animated/bulb/6.svg')] bg-center bg-no-repeat overflow-visible z-10",
        bulbAfterAnimation,
        bulbImg,
        {
          hidden: searchExpanded,
        }
      )}
    >
      <div
        className={clsx(
          'group-hover:animate-score-badge-tooltip group-hover:flex group-hover:z-10 hidden -z-20 flex-col gap-x-0 top-[52px] justify-start items-start font-sans absolute -left-[150px] md:-left-[94px] w-[229px] h-18 py-2 px-4 rounded-lg border-gray-750 border bg-gray-850'
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
  );
}

export default Bulb;
