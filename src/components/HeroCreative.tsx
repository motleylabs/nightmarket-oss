import clsx from 'clsx';
import { Nft } from '../graphql.types';

interface HeroImageProps {
  nft?: Nft;
  classname?: string;
  hPosition: 'left' | 'right';
  vPosition: 'top' | 'bottom';
}

const HeroImage = ({ nft, classname, hPosition, vPosition }: HeroImageProps): JSX.Element => {
  return (
    <div className={clsx('realtive', classname)}>
      <img
        className="h-48 w-48 rounded-2xl object-contain"
        alt="nft name"
        src="https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149611030.jpg?w=2000"
      />
      <div
        className={clsx('absolute flex flex-col rounded-2xl bg-themebg-800 py-2 px-4', {
          '-ml-16': hPosition === 'left',
          'right-0 -mr-20': hPosition === 'right',
          'top-4': vPosition === 'top',
          'bottom-4': vPosition === 'bottom',
        })}
      >
        <span className="text-xs text-themetext-500">Sold 1min ago</span>
        <span className="text-sm text-themeprimary-900">+22 $SAUCE</span>
        <span className="text-xs text-themetext-500">to buyer and seller</span>
      </div>
    </div>
  );
};

interface HeroCreativeProps {
  nfts: Nft[];
}

const HeroCreative = ({ nfts }: HeroCreativeProps): JSX.Element => {
  return (
    <div className="relative mx-16 h-full w-full">
      <HeroImage
        nft={nfts[0]}
        classname="bottom-0 right-1/2 absolute z-10 -mr-24"
        hPosition="left"
        vPosition="bottom"
      />
      <HeroImage
        nft={nfts[0]}
        classname="bottom-1/2 -mb-14 left-0 absolute"
        hPosition="left"
        vPosition="top"
      />
      <HeroImage
        nft={nfts[0]}
        classname="bottom-1/2 -mb-14 right-0 absolute"
        hPosition="right"
        vPosition="bottom"
      />
      {/* <div className="relative flex gap-20">
        <HeroImage nft={nfts[0]} classname="" hPosition="left" vPosition="bottom" />
        <HeroImage nft={nfts[0]} classname="" hPosition="left" vPosition="top" />
      </div> */}
    </div>
  );
};

export default HeroCreative;
