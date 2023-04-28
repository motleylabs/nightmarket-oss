import { createBuddyClient } from '@ladderlabs/buddylink';
import { BuddyClient } from '@ladderlabs/buddylink/dist/esm/instructions/buddy/BuddyClient';
import type { NodeWallet } from '@ladderlabs/buddylink/dist/esm/instructions/buddy/create-buddy-client';
import { useConnection } from '@solana/wallet-adapter-react';
import type { TransactionInstruction } from '@solana/web3.js';
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { useRequest } from 'ahooks';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';
import { COOKIE_REF } from '../pages/_app';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ErrorWithLogs } from '../typings';
import { getCookie, setCookie } from '../utils/cookies';
import { getBuddyStats } from '../utils/referral';

interface CreateContext {
  created: boolean;
  creating: boolean;
  onCreateBuddy: (name: string, referrer: string) => Promise<void>;
  createBuddyInstructions: (name: string, referrer: string) => Promise<TransactionInstruction[]>;
  validateName: (name: string) => Promise<boolean>;
}

export function useCreateBuddy(): CreateContext {
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [client, setClient] = useState<BuddyClient | null>(null);
  const { connection } = useConnection();
  const { connected, publicKey, signAllTransactions, signTransaction } = useWalletContext();

  useEffect(() => {
    if (connection && publicKey && signTransaction) {
      const buddyClient = createBuddyClient(
        connection,
        {
          publicKey,
          signAllTransactions,
          signTransaction,
        } as NodeWallet,
        config.referralOrg
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
    [connected, publicKey, signTransaction, client]
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
      } catch (err: unknown) {
        const error = err as ErrorWithLogs;

        const parsedError = await client?.parseError(error.message);
        notifyInstructionError(error, {
          operation: 'Create Buddy',
          metadata: {
            userPubkey: publicKey.toBase58(),
            programLogs: error.logs,
            nft: null,
          },
        });
        toast(parsedError, { type: 'error' });
        setCreating(false);
        setCreated(false);
      }
    },
    [connected, publicKey, signTransaction, createBuddyInstructions, connection, client]
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
  const { connected, publicKey, signAllTransactions, signTransaction } = useWalletContext();

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
        config.referralOrg
      );

      const buddyName = name.toLowerCase();

      const arrayOfInstructions = await buddyClient.claimInstructions(buddyName);

      const { blockhash } = await connection.getLatestBlockhash();

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

        setClaiming(false);
        setClaimed(true);
        toast('Claimed Rewards', { type: 'success' });
      } catch (err: unknown) {
        const error = err as ErrorWithLogs;

        const parsedError = await buddyClient?.parseError(error.message);
        notifyInstructionError(error, {
          operation: 'Claim Buddy',
          metadata: {
            userPubkey: publicKey.toBase58(),
            programLogs: error.logs,
            nft: null,
          },
        });
        toast(parsedError, { type: 'error' });
        setClaiming(false);
        setClaimed(false);
      }
    },
    [connected, publicKey, connection, signTransaction, signAllTransactions]
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
    } catch (err: unknown) {
      setError(err as AxiosError);
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

export interface BuddyStatsData {
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

interface CachedBuddyProps {
  wallet: string;
}

export function useBuddy(address?: string) {
  return useRequest(getBuddyStats, {
    cacheKey: `getBuddyStats-${address ?? ''}`,
    ready: !!address,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    defaultParams: [address!],
    staleTime: 300000,
    cacheTime: -1,
  });
}

export function useCachedBuddy(props: CachedBuddyProps) {
  const { data: buddy, loading } = useBuddy(props.wallet);

  const { createBuddyInstructions, validateName } = useCreateBuddy();
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction } = useWalletContext();

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
        (await createBuddyInstructions(generateRandomString(10), refId)) || [];

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
      // eslint-disable-next-line no-console
      console.error('failed buddy sign', e);
    } finally {
      setCookie(COOKIE_REF, '', 0);
    }

    return transaction;
  }, [
    buddy?.username,
    connected,
    connection,
    createBuddyInstructions,
    loading,
    publicKey,
    signTransaction,
    validateName,
  ]);

  return { linkBuddy };
}

function generateRandomString(length: number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
