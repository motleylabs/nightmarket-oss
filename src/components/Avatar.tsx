import { useLazyQuery } from '@apollo/client';
import { PublicKey } from '@solana/web3.js';
import clsx from 'clsx';
import { useEffect } from 'react';
import { Wallet } from '../graphql.types';
import getProfileInfoQuery from '../queries/getProfileInfoFromPubkey.graphql';

enum AvatarSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

interface ProfileData {
  wallet: Wallet;
}

interface ProfileVariables {
  pubKey: string;
}

interface AvatarProps {
  image?: string;
  address: string;
  size?: AvatarSize;
  enableProfile?: boolean; // enables fetching twitter handle/image
}

function Avatar({ image, size = AvatarSize.Medium, enableProfile = true, address }: AvatarProps) {
  const [profileQuery, profileContext] = useLazyQuery<ProfileData, ProfileVariables>(
    getProfileInfoQuery
  );

  useEffect(() => {
    async function queryProfileData(address: string) {
      if (enableProfile) {
        profileQuery({
          variables: {
            pubKey: address,
          },
        });
      }
    }
    if (!image) queryProfileData(address);
  }, [profileQuery, image, address, enableProfile]);

  if (image) {
    return (
      <img
        src={image}
        alt={address}
        className={clsx(clsx, 'rounded-full', {
          'h-10 w-10': size === AvatarSize.Medium,
          'h-6 w-6': size === AvatarSize.Small,
          'h-12 w-12': size === AvatarSize.Large,
        })}
      />
    );
  }

  return (
    <>
      {enableProfile &&
      profileContext.called &&
      !profileContext.loading &&
      profileContext?.data?.wallet.profile ? (
        <img
          src={profileContext.data?.wallet.profile?.profileImageUrlLowres}
          alt={address}
          className={clsx(clsx, 'rounded-full', {
            'h-10 w-10': size === AvatarSize.Medium,
            'h-6 w-6': size === AvatarSize.Small,
            'h-12 w-12': size === AvatarSize.Large,
          })}
        />
      ) : (
        <img
          src={'/images/placeholder.png'}
          alt={address}
          className={clsx(clsx, 'rounded-full', {
            'h-10 w-10': size === AvatarSize.Medium,
            'h-6 w-6': size === AvatarSize.Small,
            'h-12 w-12': size === AvatarSize.Large,
          })}
        />
      )}
    </>
  );
}

export default Avatar;
