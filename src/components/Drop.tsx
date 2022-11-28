import React from 'react';
import Icon from './Icon';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';
import Link from 'next/link';
import useCountdown from '../hooks/countdown';
import { useTranslation } from 'next-i18next';
import { asCompactNumber } from '../modules/number';

interface DropProps {
  title: string;
  description: string;
  price: number;
  supply: number;
  image: string;
  link: string;
  launchDate: Date;
}

export default function Drop({
  title,
  description,
  price,
  supply,
  image,
  link,
  launchDate,
}: DropProps) {
  const { days, hours, minutes, seconds } = useCountdown(launchDate);
  const { t } = useTranslation('home');
  return (
    <div className="w-full max-w-3xl flex-shrink-0 items-center  gap-6 rounded-2xl bg-gray-800 p-4 md:flex md:p-6">
      <div className="flex flex-shrink-0 flex-row items-center gap-4 md:inline-block md:items-start">
        <img
          src={image}
          alt={`${title}-drop`}
          className="aspect-square max-h-12  rounded-lg object-cover md:max-h-80 "
        />
        <h6 className="inline-block text-xl font-semibold md:hidden">{title}</h6>
      </div>
      <div className="flex flex-col">
        <h6 className="hidden text-xl font-semibold md:inline-block">{title}</h6>
        <p className="mt-2 text-xs text-gray-300 md:text-base">{description}</p>
        <ul className="mt-2 flex flex-row flex-wrap items-center gap-6  sm:flex-nowrap md:mt-6 md:justify-start md:gap-8">
          <li className="flex    flex-col items-start ">
            <p className="text-xs font-light text-gray-300">{t('drops.price')}</p>
            <p className="flex flex-row items-center gap-1 text-sm font-semibold md:text-base">
              <Icon.Sol />
              {price}
            </p>
          </li>
          <li className="flex    flex-col items-start ">
            <p className="text-xs font-light text-gray-300">{t('drops.supply')}</p>
            <p className="flex flex-row items-center text-sm  font-semibold md:text-base">
              {asCompactNumber(supply)}
            </p>
          </li>
          {/* Will be added in later */}
          {/* <li className="flex min-w-[92px] flex-col items-start whitespace-nowrap">
            <p className="text-xs font-light text-gray-300">{t('drops.drops')}</p>
            <p className="text-sm  font-semibold md:text-base">
              {days}d {hours}h {minutes}m {seconds}s
            </p>
          </li> */}

          <li className="flex items-center justify-end  md:hidden">
            <Button
              size={ButtonSize.Small}
              className="w-full font-semibold"
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gradient}
              color={ButtonColor.Gradient}
            >
              {t('drops.view')}
            </Button>
          </li>
        </ul>
        <div className="mt-6 hidden md:inline-block">
          <Button
            className="inline-block w-full font-semibold md:w-auto"
            background={ButtonBackground.Slate}
            border={ButtonBorder.Gray}
            color={ButtonColor.Gray}
            disabled={true}
          >
            {t('drops.details')}
          </Button>
        </div>
      </div>
    </div>
  );
}
