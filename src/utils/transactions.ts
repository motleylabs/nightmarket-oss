import type {
  Commitment,
  Connection,
  PublicKey,
  SignatureStatus,
  TransactionInstruction,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';

import { reduceSettledPromise } from './promises';

interface BuildTransactionProps {
  instructionsPerTransactions: number;
  blockhash: string;
  instructions: TransactionInstruction[];
  payer: PublicKey;
}

const DEFAULT_TIMEOUT = 30000;

const chunk = <T>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_: T, i: number) =>
    arr.slice(i * size, i * size + size)
  );

export const wait = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export async function buildTransaction({
  instructionsPerTransactions,
  blockhash,
  instructions,
  payer,
}: BuildTransactionProps): Promise<Transaction[]> {
  const ixChunks = chunk(instructions, instructionsPerTransactions);

  const pendingTransactions: Transaction[] = [];
  for (let i = 0; i < ixChunks.length; i++) {
    const bulkTransaction = new Transaction();
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
      // send all tx in intervals to avoid overloading the network
      return new Promise<{ tx: string; id: number }>((resolve, reject) => {
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
          connection
            .sendRawTransaction(tx.serialize())
            .then((txHash) => resolve({ tx: txHash, id: i }))
            .catch((e) => {
              reject(e);
            });
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
      // send all tx in intervals to avoid overloading the network
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
          connection
            .sendRawTransaction(tx.serialize(), { skipPreflight: true })
            .then(async (txHash) => {
              // eslint-disable-next-line no-console
              console.log('Started awaiting confirmation for', txHash);

              const confirmation = await awaitTransactionSignatureConfirmation(
                txHash,
                DEFAULT_TIMEOUT,
                connection
              );

              if (!confirmation) throw new Error('Timed out awaiting confirmation on transaction');

              if (confirmation.err) {
                // eslint-disable-next-line no-console
                console.error(confirmation.err);
                throw new Error('Transaction failed: Custom instruction error');
              }

              resolve(txHash);
            })
            .catch((e) => {
              reject(e);
            });
        }, i * txInterval);
      });
    })
  );

  return pendingSigned;
}

export async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = 'recent',
  queryStatus = false
) {
  let done = false;
  let status: SignatureStatus | null = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  await new Promise((resolve, reject) => {
    (async () => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        reject(new Error('timeout'));
      }, timeout);
      try {
        subId = connection.onSignature(
          txid,
          (result, context) => {
            done = true;
            status = {
              err: result.err,
              slot: context.slot,
              confirmations: 0,
            };
            if (result.err) {
              // eslint-disable-next-line no-console
              console.log('Rejected via websocket', result.err);
              if (result.err === null) {
                resolve(result.err);
              } else {
                reject(result.err);
              }
            } else {
              // eslint-disable-next-line no-console
              console.log('Resolved via websocket', result);
              resolve(result);
            }
          },
          commitment
        );
      } catch (e) {
        done = true;
        // eslint-disable-next-line no-console
        console.error('WS error in setup', txid, e);
      }
      while (!done && queryStatus) {
        /* eslint-disable */
        (async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([txid]);
            status = signatureStatuses && signatureStatuses.value[0];
            if (!done) {
              if (!status) {
                console.log('REST null result for', txid, status);
              } else if (status.err) {
                console.log('REST error for', txid, status);
                done = true;
                reject(status.err);
              } else if (!status.confirmations) {
                console.log('REST no confirmations for', txid, status);
              } else {
                console.log('REST confirmation for', txid, status);
                done = true;
                resolve(status);
              }
            }
          } catch (e) {
            if (!done) {
              console.log('REST connection error: txid', txid, e);
            }
          }
        })();
        // eslint-disable-next-line no-await-in-loop
        await wait(2000);
      }
    })();
  })
    .catch((err) => {
      if (err.timeout && status) {
        status.err = { timeout: true };
      }
      connection.removeSignatureListener(subId);
    })
    .then((_) => {
      connection.removeSignatureListener(subId);
    });
  done = true;
  return status;
}
