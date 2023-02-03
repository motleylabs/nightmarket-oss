import { createBuddyClient } from '@ladderlabs/buddylink';
import { NodeWallet } from '@ladderlabs/buddylink/dist/esm/instructions/buddy/create-buddy-client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';
import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';

interface CreateContext {
  created: boolean;
  creating: boolean;
  onCreateBuddy: (name: string, referrer: string) => Promise<void>;
}

// Do we want to store this information anywhere?

export function useCreateBuddy(): CreateContext {
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const { connection } = useConnection();
  const { connected, publicKey, signAllTransactions, signTransaction } = useWallet();

  const onCreateBuddy = useCallback(
    async (name: string, referrer: string) => {
      if (!connected || !publicKey || !signTransaction) {
        throw new Error('not all params provided');
      }
      setCreating(true);

      const buddyClient = createBuddyClient(
        connection,
        {
          publicKey,
          signAllTransactions,
          signTransaction,
        } as NodeWallet,
        config.buddylink.organizationName
      );
      const referrerName = referrer.toLowerCase();
      const buddyName = name.toLowerCase();

      const referrerAccount = await buddyClient.getBuddy(referrerName);

      if (referrerAccount && referrerAccount.authority.toString() === publicKey.toString()) {
        throw new Error('Buddy referred by the same wallet');
      }

      const arrayOfInstructions = await buddyClient.createBuddyInstructions(
        buddyName,
        config.buddylink.buddyBPS,
        referrerName
      );

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

export function useClaimBuddy() {
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const { connection } = useConnection();
  const { connected, publicKey, signAllTransactions, signTransaction } = useWallet();

  const onClaimBuddy = useCallback(
    async (name: string) => {
      if (!connected || !publicKey || !signTransaction) {
        throw new Error('not all params provided');
      }
      setClaiming(true);

      const buddyClient = createBuddyClient(
        connection,
        {
          publicKey,
          signAllTransactions,
          signTransaction,
        } as NodeWallet,
        config.buddylink.organizationName
      );

      const buddyName = name.toLowerCase();

      const arrayOfInstructions = await buddyClient.claimInstructions(buddyName);

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
        setClaiming(false);
        setClaimed(true);
      } catch (err: any) {
        notifyInstructionError(err, {
          operation: 'Claim Buddy',
          metadata: {
            userPubkey: publicKey.toBase58(),
            programLogs: err.logs,
            nft: null,
          },
        });
        toast(err.message, { type: 'error' });
        setClaiming(false);
        setClaimed(false);
      }
    },
    [connected, publicKey, signTransaction, signAllTransactions]
  );

  return {
    claimed,
    claiming,
    onClaimBuddy,
  };
}

interface Transfer {
  from: string;
  to:
    | {
        pubkey: string;
        amount: number;
      }
    | {
        pubkey: string;
        amount: number;
      }[]
    | boolean;
}

interface TransactionHistory {
  instruction: string;
  userInstruction: string;
  allTransfers: Transfer[] | Transfer;
  currentUserTransfer: Transfer;
  amount: number;
  amountReadable: string;
  signature: string;
  blocktime: number;
  readableBlocktime: string;
}

interface BuddyHistoryProps {
  wallet: string;
  organisation: string;
}

export function useBuddyHistory(params: BuddyHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TransactionHistory[] | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const url = config.referralUrl;
  const pathUserTransaction = `${url}referral/userTransactions&wallet=${params.wallet}&organisation=${params.organisation}`;
  const key = config.referralKey;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(pathUserTransaction, {
        headers: {
          Authorization: key,
        },
      });
      setData(response.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pathUserTransaction, key]);

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refreshTransactions: fetchData };
}

export interface ReferredData {
  username: string;
  publicKey: string;
  userWallet: string;
  referrer: string;
  dateCreated: number;
  numberOfReferredUsers: number;
}

interface BuddyStatsData {
  username: string;
  userWallet: string;
  publicKey: string;
  referrer: string;
  totalEarned: number;
  totalClaimed: number;
  totalClaimable: number;
  recentSignatures: [];
  buddies: ReferredData[];
  chestAddress: string;
}

interface BuddyStatsProps {
  wallet: string;
  organisation: string;
}

export function useBuddyStats(params: BuddyStatsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BuddyStatsData | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const url = config.referralUrl;
  const pathReferralUser = `${url}referral/user&wallet=${params.wallet}&organisation=${params.organisation}`;
  const key = config.referralKey;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(pathReferralUser, {
        headers: {
          Authorization: key,
        },
      });
      setData(response.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pathReferralUser, key]);

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refreshBuddy: fetchData };
}
