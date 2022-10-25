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
    <div className="flex max-w-5xl flex-col gap-6 rounded-2xl bg-gray-800 p-6 md:flex-row">
      <div className="flex flex-row items-center gap-4 md:inline-block md:w-3/4 md:items-start">
        <img
          src={image}
          alt={`${title}-drop`}
          className="aspect-square max-h-12 rounded-lg object-cover md:max-h-80 md:w-full"
        />
        <h6 className="inline-block text-xl font-semibold md:hidden">{title}</h6>
      </div>
      <div className="flex flex-col gap-2">
        <h6 className="hidden text-xl font-semibold md:inline-block">{title}</h6>
        <p className="text-xs text-gray-300 md:text-base">{description}</p>
        <ul className="flex flex-row flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:justify-start">
          <li className="flex w-20 flex-col items-start whitespace-nowrap md:w-32">
            <p className="text-xs font-light text-gray-300">{t('drops.drops')}</p>
            {/* TODO: timer */}
            <p className="text-sm  font-semibold md:text-base">
              {days}d {hours}h {minutes}m {seconds}s
            </p>
          </li>
          <li className="flex w-20 flex-col items-start md:w-auto">
            <p className="text-xs font-light text-gray-300">{t('drops.price')}</p>
            <p className="flex flex-row items-center text-sm  font-semibold md:text-base">
              <Icon.Sol />
              {price}
            </p>
          </li>
          <li className="flex w-20 flex-col items-start md:w-auto">
            <p className="text-xs font-light text-gray-300">{t('drops.supply')}</p>
            <p className="flex flex-row items-center text-sm  font-semibold md:text-base">
              {asCompactNumber(supply)}
            </p>
          </li>
          {/* 
          PS: Not removing this comment quite yet as we might want to go back to this structure
          <li className="mt-4 flex w-full justify-end  md:hidden">
            <Button
              className="w-full font-semibold"
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gradient}
              color={ButtonColor.Gradient}
            >
              {t('drops.view')}
            </Button>
          </li> */}
        </ul>
        <div className="inline-block">
          <Link href={link}>
            <a target={'_self'}>
              <Button
                size={ButtonSize.Small}
                className="inline-block w-full font-semibold md:w-auto"
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
              >
                {t('drops.details')}
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
