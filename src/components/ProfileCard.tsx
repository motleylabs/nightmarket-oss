import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { Wallet } from '../graphql.types';
import Img from './Image';

interface ProfileCardProps {
  wallet: Wallet;
  className?: string;
}

export default function ProfileCard({ wallet, className }: ProfileCardProps): JSX.Element {
  const { t } = useTranslation('profile');

  return (
    <div
      className={clsx(
        'relative flex w-full flex-col overflow-clip rounded-md bg-gray-900 shadow-md shadow-black transition duration-300 hover:scale-[1.02]',
        className
      )}
    >
      <img
        src={wallet.previewBanner as string}
        alt={`profile banner for ${wallet.address}`}
        className="relative h-32 w-full flex-shrink-0 object-cover"
      />
      <div className="p-4">
        <div className="flex flex-row items-center justify-between">
          <Img
            fallbackSrc="/images/moon.svg"
            src={wallet.previewImage as string}
            alt={`profile avatar for ${wallet.address}`}
            className="relative z-20 -mt-12 h-24 w-24 rounded-full border-2 border-gray-800 bg-gray-800"
          />
        </div>
        <h1 className="mt-6 text-xl">{wallet.displayName}</h1>
        <div className="mt-4 flex gap-2 text-white">
          <div className="flex flex-row gap-1">
            {wallet.compactOwnedCount} <span className="text-gray-300">{t('collected', { ns: 'profile' })}</span>
          </div>
          <div className="flex flex-row gap-1">
            {wallet.compactCreatedCount} <span className="text-gray-300">{t('created', { ns: 'profile' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileCardSkeletonProps {
  className?: string;
}

function ProfileCardSkeleton({ className }: ProfileCardSkeletonProps): JSX.Element {
  return (
    <div
      className={clsx(
        'relative flex w-full animate-pulse flex-col overflow-clip rounded-md bg-gray-900 shadow-md shadow-black duration-300',
        className
      )}
    >
      <div className="relative h-32 w-full flex-shrink-0">
        <div className="absolute top-0 right-0 bottom-0 left-0 z-10 bg-gray-700" />
      </div>
      <div className="p-4">
        <div className="relative z-20 -mt-12 h-16 w-16 rounded-full bg-gray-800 md:h-12 md:w-12 lg:h-24 lg:w-24" />
        <div className="mt-6 h-6 w-24 rounded-md bg-gray-700 lg:h-8" />
        <div className="mt-4 flex gap-4">
          <div className="h-6 w-20 rounded-md bg-gray-700" />
          <div className="h-6 w-20 rounded-md bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

ProfileCard.Skeleton = ProfileCardSkeleton;
