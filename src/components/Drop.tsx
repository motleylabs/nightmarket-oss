import { useTranslation } from 'next-i18next';
import React from 'react';

import { asCompactNumber } from '../modules/number';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';
import Icon from './Icon';
import Img from './Image';

interface DropProps {
  title: string;
  description: string;
  price: number | string;
  supply: number;
  image: string;
  link: string;
  launchDate: Date;
}

export default function Drop({ title, description, price, supply, image }: DropProps) {
  const { t } = useTranslation('home');
  return (
    <div className="w-full max-w-3xl flex-shrink-0 items-center  gap-6 rounded-2xl bg-gray-800 p-4 md:flex md:p-6">
      <div className="flex flex-shrink-0 flex-row items-center gap-4 md:inline-block md:items-start">
        <Img
          fallbackSrc="/images/moon.svg"
          src={image}
          alt={`${title}-drop`}
          className="aspect-square max-h-12  rounded-lg object-cover md:max-h-80 "
        />
        <h6 className="inline-block text-xl font-semibold md:hidden">{title}</h6>
      </div>
      <div className="flex flex-col">
        <h6 className="hidden text-xl font-semibold md:inline-block">{title}</h6>
        <p className="mt-2 text-sm text-gray-300 md:text-base">{description}</p>
        <ul className="mt-2 flex flex-row flex-wrap items-center gap-6  sm:flex-nowrap md:mt-6 md:justify-start md:gap-8">
          <li className="flex    flex-col items-start ">
            <p className="text-sm font-light text-gray-300">{t('drops.price', { ns: 'home' })}</p>
            <p className="flex flex-row items-center gap-1 text-sm font-semibold md:text-base">
              <Icon.Sol />
              {price}
            </p>
          </li>
          <li className="flex    flex-col items-start ">
            <p className="text-sm font-light text-gray-300">{t('drops.supply', { ns: 'home' })}</p>
            <p className="flex flex-row items-center text-sm  font-semibold md:text-base">
              {asCompactNumber(supply)}
            </p>
          </li>

          <li className="flex items-center justify-end  md:hidden">
            <Button
              size={ButtonSize.Small}
              className="w-full font-semibold"
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              disabled={true}
            >
              {t('drops.details', { ns: 'home' })}
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
            {t('drops.details', { ns: 'home' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
