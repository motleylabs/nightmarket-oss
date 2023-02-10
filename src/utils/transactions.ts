import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';
import { reduceSettledPromise } from './promises';

interface BuildTransactionProps {
  instructionsPerTransactions: number;
  blockhash: string;
  instructions: TransactionInstruction[];
  payer: PublicKey;
}

// https://decipher.dev/30-seconds-of-typescript/docs/chunk/
const chunk = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_: any, i: number) =>
    arr.slice(i * size, i * size + size)
  );

export async function buildTransaction({
  instructionsPerTransactions,
  blockhash,
  instructions,
  payer,
}: BuildTransactionProps): Promise<Transaction[]> {
  const ixChunks = chunk(instructions, instructionsPerTransactions);

  const pendingTransactions: Transaction[] = [];
  for (let i = 0; i < ixChunks.length; i++) {
    let bulkTransaction = new Transaction();
    bulkTransaction.recentBlockhash = blockhash;
    bulkTransaction.feePayer = payer;
    for (let j = 0; j < ixChunks[i].length; j++) {
      if (ixChunks[i][j]) {
        bulkTransaction.add(ixChunks[i][j]);
      }
    }

    pendingTransactions.push(bulkTransaction);
  }

  return pendingTransactions;
}

interface QueueTransactionSignProps {
  transactions: Transaction[];
  signTransaction: <T extends Transaction>(transaction: T) => Promise<T>;
  signAllTransactions: (<T extends Transaction>(transactions: T[]) => Promise<T[]>) | undefined;
  txInterval: number; //How long to wait between signing in milliseconds
  connection: Connection;
}

export async function queueTransactionSign({
  transactions,
  signAllTransactions,
  signTransaction,
  txInterval,
  connection,
}: QueueTransactionSignProps) {
  let signedTxs: Transaction[] = [];
  if (signAllTransactions) {
    signedTxs = await signAllTransactions(transactions);
  } else {
    //fallback to sign tx batches individually (if wallet doesn't support signAll)
    const settledTxs = await Promise.allSettled(
      transactions.map(async (tx) => {
        const signedTx = await signTransaction(tx);
        return signedTx;
      })
    );
    const { fulfilled } = reduceSettledPromise(settledTxs);

    signedTxs = fulfilled;
  }

  const pendingSigned = await Promise.allSettled(
    signedTxs.map((tx, i, allTx) => {
      //send all tx in intervals to avoid overloading the network
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
          connection.sendRawTransaction(tx.serialize()).then((txHash) => resolve(txHash));
        }, i * txInterval);
      });
    })
  );

  return pendingSigned;
}

interface QueueVersionedTransactionSignProps {
  transactions: VersionedTransaction[];
  signTransaction: <T extends VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions:
    | (<T extends VersionedTransaction>(transactions: T[]) => Promise<T[]>)
    | undefined;
  txInterval: number; //How long to wait between signing in milliseconds
  connection: Connection;
}

export async function queueVersionedTransactionSign({
  transactions,
  signAllTransactions,
  signTransaction,
  txInterval,
  connection,
}: QueueVersionedTransactionSignProps) {
  let signedTxs: VersionedTransaction[] = [];

  if (signAllTransactions) {
    signedTxs = await signAllTransactions(transactions);
  } else {
    //fallback to sign tx batches individually (if wallet doesn't support signAll)
    const settledTxs = await Promise.allSettled(
      transactions.map(async (tx) => {
        const signedTx = await signTransaction(tx);
        return signedTx;
      })
    );
    const { fulfilled } = reduceSettledPromise(settledTxs);

    signedTxs = fulfilled;
  }

  const pendingSigned = await Promise.allSettled(
    signedTxs.map((tx, i, allTx) => {
      //send all tx in intervals to avoid overloading the network
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
          connection
            .sendRawTransaction(tx.serialize())
            .then((txHash) => resolve(txHash))
            .catch((e) => {
              reject(e);
            });
        }, i * txInterval);
      });
    })
  );

  return pendingSigned;
}
