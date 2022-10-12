import React from 'react';
import Icon from './Icon';
import Button, { ButtonType } from './Button';
import Link from 'next/link';

interface DropProps {
  title: string;
  description: string;
  price: number;
  supply: number;
  image: string;
  link: string;
}

export default function Drop({ title, description, price, supply, image, link }: DropProps) {
  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 md:flex-row">
      <img
        src={image}
        alt={`${title}-drop`}
        className="aspect-square w-full rounded-lg object-cover md:w-1/3"
      />
      <div className="flex flex-col gap-4">
        <h6 className="text-xl font-semibold">{title}</h6>
        <p className="text-base text-gray-300">{description}</p>
        <ul className="flex flex-row items-center justify-start gap-9">
          <li className="flex flex-col">
            <p className="text-xs font-light text-gray-300">Drops</p>
            {/* TODO: timer */}
            <p className="text-base font-semibold">2d 16h 42s</p>
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
