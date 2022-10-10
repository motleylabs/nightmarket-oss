import React from 'react';
import Icon from './Icon';
import Button, { ButtonType } from './Button';

interface DropProps {
    title: string;
    description: string;
    price: number;
    supply: number;
    image: string;
    link: string;
}

export default function Drop({title, description, price, supply, image, link}: DropProps){
    return (
        <div className="bg-gray-900 p-6 rounded-lg flex flex-row gap-6">
            <img src={image} alt={`${title}-drop`} className="w-1/3 object-cover rounded-lg aspect-square"/>
            <div className="flex flex-col gap-4">
                <h6 className="text-xl font-semibold">{title}</h6>
                <p className="text-base text-gray-300">{description}</p>
                <ul className="flex flex-row gap-9 justify-start items-center">
                    <li className="flex flex-col">
                        <p className="text-xs font-light text-gray-300">Drops</p>
                        {/* TODO: timer */}
                        <p className="text-base font-semibold">2d 16h 42s</p>
                    </li>
                    <li className="flex flex-col">
                        <p className="text-xs font-light text-gray-300">Price</p>
                        <p className="text-base font-semibold flex flex-row items-center"><Icon.Sol/>{price}</p>
                    </li>
                    <li className="flex flex-col">
                        <p className="text-xs font-light text-gray-300">Supply</p>
                        <p className="text-base font-semibold flex flex-row items-center">{supply.toLocaleString('en-US')}</p>
                    </li>
                </ul>
                <div className="inline-block">
                    <Button className="font-semibold" type={ButtonType.Secondary}>View details</Button>
                </div>
            </div>
        </div>
    )
}