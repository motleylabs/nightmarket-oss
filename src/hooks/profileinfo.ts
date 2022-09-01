import { useQuery } from '@apollo/client';
import { Wallet } from '../graphql.types';
import { ProfileInfoByAddressQuery } from '../queries/profile.graphql';

export interface ProfileInfo {
  wallet: Wallet | undefined;
}

export interface ProfileVariables {
  address: string;
}

export default function useProfileInfo(address: string): ProfileInfo {
  const profileContext = useQuery<ProfileInfo, ProfileVariables>(ProfileInfoByAddressQuery, {
    variables: {
      address,
    },
  });

  return {
    wallet: profileContext.data?.wallet,
  };
}
