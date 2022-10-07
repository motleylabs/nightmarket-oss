import clsx from 'clsx';
import { Nft } from '../graphql.types';

interface HeroImageProps {
  nft?: Nft;
  classname?: string;
  imgUrlTemp: string; // to be removed once live data arrives
  hPosition: 'left' | 'right';
  vPosition: 'top' | 'bottom';
}

const HeroImage = ({
  nft,
  imgUrlTemp,
  classname,
  hPosition,
  vPosition,
}: HeroImageProps): JSX.Element => {
  return (
    <div className={clsx('realtive', classname)}>
      <img
        className="h-32 w-32 rounded-2xl object-contain lg:h-48 lg:w-48"
        alt="nft name"
        src={imgUrlTemp}
      />
      <div
        className={clsx(
          'absolute flex h-14 w-28 flex-col rounded-2xl bg-gray-800 py-1.5 px-3 lg:h-16 lg:w-36 lg:py-2 lg:px-4',
          {
            '-ml-16': hPosition === 'left',
            'right-0 -mr-20': hPosition === 'right',
            'top-16': vPosition === 'top',
            'bottom-4': vPosition === 'bottom',
          }
        )}
      >
        <span className="truncate text-xs text-gray-500">Sold 1min ago</span>
        <span className=" text-xs text-orange-600 lg:text-sm ">+22 $SAUCE</span>
        <span className=" truncate text-xs text-gray-500">to buyer and seller</span>
      </div>
    </div>
  );
};

interface HeroCreativeProps {
  nfts: Nft[];
}

const HeroCreative = ({ nfts }: HeroCreativeProps): JSX.Element => {
  return (
    <div className="relative h-72 w-72 lg:h-[300px] lg:w-[450px]">
      <HeroImage
        imgUrlTemp="https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149611030.jpg?w=2000"
        nft={nfts[0]}
        classname="bottom-0 right-1/2 absolute z-10 -mr-16 lg:-mr-24"
        hPosition="left"
        vPosition="bottom"
      />
      <HeroImage
        imgUrlTemp="https://metadata.degods.com/g/3097.png"
        nft={nfts[0]}
        classname="bottom-1/2 -mb-14 lg:-mb-4 left-0 absolute"
        hPosition="left"
        vPosition="top"
      />
      <HeroImage
        imgUrlTemp="https://assets.holaplex.tools/ipfs/bafybeickme6bmkora47xisln47mz5wckpcx7pjvotouo37dpkdyzcznxvm?width=400&path=2503.png"
        nft={nfts[0]}
        classname="bottom-1/2 -mb-20 lg:-mb-14 right-0 absolute"
        hPosition="right"
        vPosition="bottom"
      />
    </div>
  );
};

export default HeroCreative;
