import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLazyQuery, QueryResult, OperationVariables } from '@apollo/client';
import GetViewerQuery from './../queries/viewer.graphql';
import { Viewer, Wallet } from './../graphql.types';

export interface GetViewerData {
  viewer: Viewer;
  wallet: Wallet;
}

export default function useViewer(): QueryResult<GetViewerData, OperationVariables> {
  const { publicKey } = useWallet();
  const [getViewer, viewerQueryResult] = useLazyQuery<GetViewerData>(GetViewerQuery, {
    variables: {
      address: publicKey?.toBase58(),
    },
  });

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    getViewer();
  }, [publicKey, getViewer]);

  return viewerQueryResult;
}
