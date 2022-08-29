import { useLazyQuery, useQuery } from '@apollo/client';
import { Wallet } from '../graphql.types';
import getProfileInfoQuery from '../queries/getProfileInfoFromPubkey.graphql';

export interface ProfileInfo {
  wallet: Wallet | undefined;
}

export interface ProfileVariables {
  pubKey: string;
}

export default function useProfileInfo(address: string): ProfileInfo {
  const profileContext = useQuery<ProfileInfo, ProfileVariables>(getProfileInfoQuery, {
    variables: {
      pubKey: address,
    },
  });

  return {
    wallet: profileContext.data?.wallet,
  };
}
