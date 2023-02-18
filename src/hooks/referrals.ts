import { createBuddyClient } from '@ladderlabs/buddylink';
import { NodeWallet } from '@ladderlabs/buddylink/dist/esm/instructions/buddy/create-buddy-client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import axios, { AxiosError } from 'axios';
import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';
import { getCookie, setCookie } from '../utils/cookies';
import { COOKIE_REF } from '../pages/_app';
import { BuddyClient } from '@ladderlabs/buddylink/dist/esm/instructions/buddy/BuddyClient';

interface CreateContext {
  created: boolean;
  creating: boolean;
  onCreateBuddy: (name: string, referrer: string) => Promise<void>;
  createBuddyInstructions: (name: string, referrer: string) => Promise<TransactionInstruction[]>;
  validateName: (name: string) => Promise<boolean>;
}

// Do we want to store this information anywhere?

export function useCreateBuddy(): CreateContext {
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [client, setClient] = useState<BuddyClient | null>(null);
  const { connection } = useConnection();
  const { connected, publicKey, signAllTransactions, signTransaction } = useWallet();

  useEffect(() => {
    if (connection && publicKey && signTransaction) {
      const buddyClient = createBuddyClient(
        connection,
        {
          publicKey,
          signAllTransactions,
          signTransaction,
        } as NodeWallet,
        config.buddylink.organizationName
      );

      setClient(buddyClient);
    }
  }, [connection, publicKey, signAllTransactions, signTransaction]);

  const createBuddyInstructions = useCallback(
    async (name: string, referrer: string) => {
      if (!connected || !publicKey || !signTransaction || !client) {
        throw new Error('not all params provided');
      }

      const referrerName = referrer.toLowerCase();

      const buddyName = name.toLowerCase();

      const referrerAccount = await client.getBuddy(referrerName);

      if (referrerAccount && referrerAccount.authority.toString() === publicKey.toString()) {
        throw new Error('Error in constructing the instruction. Try again');
      }

      const arrayOfInstructions = await client.createBuddyInstructions(
        buddyName,
        config.buddylink.buddyBPS,
        referrerName
      );

      return arrayOfInstructions;
    },
    [connected, publicKey, signTransaction, signAllTransactions, client]
  );

  const onCreateBuddy = useCallback(
    async (name: string, referrer: string) => {
      if (!connected || !publicKey || !signTransaction) {
        throw new Error('not all params provided');
      }
      setCreating(true);
      const arrayOfInstructions = await createBuddyInstructions(name, referrer);

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
    [connected, publicKey, signTransaction, signAllTransactions, client]
  );

  const validateName = useCallback(
    async (name: string) => {
      if (!client) {
        throw new Error('not all params provided');
      }

      return await client.validateName(name);
    },
    [client]
  );

  return {
    created,
    creating,
    onCreateBuddy,
    createBuddyInstructions,
    validateName,
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
  dateCreated: number;
  numberOfReferredUsers: number;
  publicKey: string;
  referrer: string;
  totalGeneratedFeeVolume: number;
  totalGeneratedMarketplaceVolume: number;
  userWallet: string;
  username: string;
}

interface BuddyStatsData {
  buddies: ReferredData[];
  chestAddress: string | null;
  dateCreated: number;
  publicKey: string | null;
  recentSignatures: [];
  referrer: string | null;
  totalClaimable: number;
  totalClaimed: number;
  totalEarned: number;
  totalGeneratedFeeVolume: number;
  totalGeneratedFeeVolumeByReferrals: number;
  totalGeneratedMarketplaceVolume: number;
  totalGeneratedMarketplaceVolumeByReferrals: number;
  userWallet: string;
  username: string | null;
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
  const key = config.referralKey;

  const pathReferralUser = useMemo(
    () => `${url}referral/user&wallet=${params.wallet}&organisation=${params.organisation}`,
    [params]
  );

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
    if (params.wallet) fetchData();
  }, [params.wallet]);

  return { data, loading, error, refreshBuddy: fetchData };
}

interface CachedBuddyProps {
  wallet: string;
  organisation: string;
}

export function useCachedBuddy(props: CachedBuddyProps) {
  const { data: buddy, loading } = useBuddyStats(props);

  const { createBuddyInstructions, validateName } = useCreateBuddy();
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();

  const linkBuddy = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction) {
      throw new Error('not all params provided');
    }
    const refId = getCookie(COOKIE_REF);

    if (loading || !refId) return null;
    if (buddy?.username) {
      setCookie(COOKIE_REF, '', 0);
      return null;
    }

    const referrerExists = !(await validateName(refId.toLowerCase()));

    if (!referrerExists) {
      setCookie(COOKIE_REF, '', 0);
      return null;
    }

    let transaction = null;
    try {
      const buddyInstructions =
        (await createBuddyInstructions(publicKey?.toString().substring(0, 8)!, refId)) || [];

      if (buddyInstructions.length === 0) {
        setCookie(COOKIE_REF, '', 0);
        return null;
      }

      const { blockhash } = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: buddyInstructions,
      }).compileToV0Message();

      transaction = new VersionedTransaction(messageV0);
    } catch (e) {
      console.error('failed buddy sign', e);
    } finally {
      setCookie(COOKIE_REF, '', 0);
    }

    return transaction;
  }, [buddy, loading, publicKey]);

  return { linkBuddy };
}
