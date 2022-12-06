import React, { useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { viewerVar } from './../cache';
import { toSol } from '../modules/sol';

interface ViewerProviderProps {
  children: JSX.Element;
}

export const ViewerProvider: React.FC<ViewerProviderProps> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) return;
    const handle = connection.onAccountChange(
      publicKey,
      (ev) => viewerVar({ ...viewerVar(), balance: ev.lamports, solBalance: toSol(ev.lamports) }),
      'confirmed'
    );
    return () => {
      connection.removeAccountChangeListener(handle);
    };
  }, [connection, publicKey]);

  useEffect(() => {
    (async () => {
      if (!publicKey) {
        return;
      }
      try {
        const balance = await connection.getBalance(publicKey);
        viewerVar({
          balance,
          address: publicKey?.toBase58() as string,
          __typename: 'Viewer',
          solBalance: toSol(balance),
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    })();
  }, [publicKey, connection]);

  return <>{children}</>;
};

export default ViewerProvider;
