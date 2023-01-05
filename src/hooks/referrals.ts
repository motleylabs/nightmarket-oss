import { createBuddyClient } from '@ladderlabs/buddylink';
import { NodeWallet } from '@ladderlabs/buddylink/dist/esm/instructions/buddy/create-buddy-client';
import { Buddy } from '@ladderlabs/buddylink/dist/esm/types/BuddyLink';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { notifyInstructionError } from '../modules/bugsnag';

interface CreateContext {
  created: boolean;
  creating: boolean;
  onCreateBuddy: (name: string) => Promise<void>;
}

// Do we want to store this information anywhere?
const ORG_NAME = 'a24nzg60';
const BPS = 0;

export function useCreateBuddy(): CreateContext {
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const { connection } = useConnection();
  const { connected, publicKey, signAllTransactions, signTransaction } = useWallet();

  const onCreateBuddy = useCallback(
    async (name: string) => {
      if (!connected || !publicKey || !signTransaction) {
        throw new Error('not all params provided');
      }
      setCreating(true);

      const buddy = createBuddyClient(
        connection,
        {
          publicKey,
          signAllTransactions,
          signTransaction,
        } as NodeWallet,
        ORG_NAME
      );

      const arrayOfInstructions = await buddy.createBuddyInstructions(name, BPS, '');

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: arrayOfInstructions,
      }).compileToV0Message();

      const transactionV0 = new VersionedTransaction(messageV0);

      try {
        const signedTx = await signTransaction(transactionV0);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        if (!signature) {
          return;
        }
        await connection.confirmTransaction(
          {
            blockhash,
            lastValidBlockHeight,
            signature,
          },
          'confirmed'
        );
        setCreating(false);
        setCreated(true);
      } catch (err: any) {
        notifyInstructionError(err, {
          operation: 'Create Buddy',
          metadata: {
            userPubkey: publicKey.toBase58(),
            programLogs: err.logs,
            nft: null,
          },
        });
        toast(err.message, { type: 'error' });
        setCreating(false);
        setCreated(false);
      }
    },
    [connected, publicKey, signTransaction, signAllTransactions]
  );

  return {
    created,
    creating,
    onCreateBuddy,
  };
}

export function useBuddy() {
  const [loadingBuddy, setLoadingBuddy] = useState(true);
  const [buddy, setBuddy] = useState<Buddy | null>(null);
  const { connection } = useConnection();
  const { publicKey, signAllTransactions, signTransaction } = useWallet();

  const gettingBuddy = useCallback(async () => {
    const buddy = createBuddyClient(
      connection,
      {
        publicKey,
        signAllTransactions,
        signTransaction,
      } as NodeWallet,
      ORG_NAME
    );

    setBuddy(await buddy.getBuddy());
    setLoadingBuddy(false);
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  useEffect(() => {
    gettingBuddy();
  }, []);

  return { loadingBuddy, buddy };
}
