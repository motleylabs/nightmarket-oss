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

export async function buildTransaction({
  instructionsPerTransactions,
  blockhash,
  instructions,
  payer,
}: BuildTransactionProps): Promise<Transaction[]> {
  const pendingTransactions: Transaction[] = [];

  const numTransactions = Math.ceil(instructions.length / instructionsPerTransactions);

  for (let i = 0; i < numTransactions; i++) {
    let bulkTransaction = new Transaction();
    let lowerIndex = i * instructionsPerTransactions;
    let upperIndex = (i + 1) * instructionsPerTransactions;
    for (let j = lowerIndex; j < upperIndex; j++) {
      if (instructions[j]) {
        bulkTransaction.add(instructions[j]);
      }
    }
    bulkTransaction.recentBlockhash = blockhash;
    bulkTransaction.feePayer = payer;
    pendingTransactions.push(bulkTransaction);
  }

  return pendingTransactions;
}

interface QueueTransactionSignProps {
  transactions: Transaction[];
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions:
    | (<T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>)
    | undefined;
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
