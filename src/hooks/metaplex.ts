import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { useCallback, useEffect, useState } from 'react';

import { getMetadataAccount } from '../utils/metaplex';

interface MetaplexProps {
  verifiedCollectionAddress: string | undefined;
}

export default function useMetaplex({ verifiedCollectionAddress }: MetaplexProps) {
  const [account, setAccount] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();

  const fetchAccountInfo = useCallback(async () => {
    if (verifiedCollectionAddress) {
      const accountPDA = getMetadataAccount(new PublicKey(verifiedCollectionAddress));

      setAccount(await Metadata.fromAccountAddress(connection, accountPDA));
      setLoading(false);
    }
  }, [connection, verifiedCollectionAddress]);

  useEffect(() => {
    if (verifiedCollectionAddress) fetchAccountInfo();
  }, [verifiedCollectionAddress, connection, fetchAccountInfo]);

  return { loading, metadata: account };
}
