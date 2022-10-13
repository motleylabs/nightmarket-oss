import React from 'react';
import Icon from './Icon';
import Button, { ButtonType } from './Button';
import Link from 'next/link';
import useCountdown from '../hooks/countdown';

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
  return (
    <div className="flex max-w-5xl flex-col gap-6 rounded-2xl bg-gray-900 p-6 md:flex-row">
      <img
        src={image}
        alt={`${title}-drop`}
        className="aspect-square max-h-60 w-full rounded-lg object-cover md:w-1/3"
      />
      <div className="flex flex-col gap-4">
        <h6 className="text-xl font-semibold">{title}</h6>
        <p className="text-base text-gray-300">{description}</p>
        <ul className="flex flex-row items-center justify-start gap-9">
          <li className="flex flex-col">
            <p className="text-xs font-light text-gray-300">Drops</p>
            {/* TODO: timer */}
            <p className="text-base font-semibold">
              {days}d {hours}h {minutes}m {seconds}s
            </p>
          </li>
          <li className="flex flex-col">
            <p className="text-xs font-light text-gray-300">Price</p>
            <p className="flex flex-row items-center text-base font-semibold">
              <Icon.Sol />
              {price}
            </p>
          </li>
          <li className="flex flex-col">
            <p className="text-xs font-light text-gray-300">Supply</p>
            <p className="flex flex-row items-center text-base font-semibold">
              {supply.toLocaleString('en-US')}
            </p>
          </li>
        </ul>
        <div className="inline-block">
          <Link href={link}>
            <a target={'_self'}>
              <Button className="font-semibold" type={ButtonType.Secondary}>
                View details
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
