/* eslint-disable no-console */
import {
  PROGRAM_ID as MTLY_RWD_PROGRAM_ID,
  createAttributeInstruction,
} from '@motleylabs/mtly-reward-center';
import type { AttributeInstructionArgs } from '@motleylabs/mtly-reward-center';
import { useConnection } from '@solana/wallet-adapter-react';
import type {
  LoadedAddresses,
  Connection,
  AddressLookupTableAccount,
  Message,
  AccountMeta,
  TransactionInstruction,
} from '@solana/web3.js';
import { TransactionMessage, PublicKey, VersionedTransaction } from '@solana/web3.js';

import { useState } from 'react';
import { toast } from 'react-toastify';

import config from '../app.config';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, Nft } from '../typings';
import { getBuyNowTransaction } from '../utils/hyperspace';
import { parseTransactionAccounts, compiledInstructionToInstruction } from '../utils/solana';
import { sendVersionedTransactionWithRetry } from '../utils/transactions';
import type { BuyListingResponse } from './buy';

interface AttributedBuyParams {
  nft: Nft;
  listing: ActionInfo | null;
}

interface AttributedBuyContext {
  buying: boolean;
  onAttributedBuyNow: ({
    nft,
    listing,
  }: AttributedBuyParams) => Promise<BuyListingResponse | undefined>;
}

const MAE_PROGRAM_ID = new PublicKey('MAEh4YsXkNqkTKrKUZta96sPPSr3wusThnsiXjAjRP8');
const SEALED_PROGRAM_IDS = [new PublicKey('M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K')];

function isSealedTransaction(accounts: AccountMeta[]): boolean {
  return accounts.some((account) =>
    SEALED_PROGRAM_IDS.some((programId) => programId.equals(account.pubkey))
  );
}

async function versionedTransactionFromBuyBuffer(
  connection: Connection,
  publicKey: PublicKey,
  buffer: Buffer
): Promise<VersionedTransaction> {
  const tx = VersionedTransaction.deserialize(buffer);

  const alts: AddressLookupTableAccount[] = [];
  const loadedAddresses: LoadedAddresses = {
    readonly: [],
    writable: [],
  };

  if (tx.message.addressTableLookups) {
    for (const alt of tx.message.addressTableLookups) {
      const table = await connection.getAddressLookupTable(alt.accountKey);
      if (table && table.value) {
        alts.push(table.value);
        const altAddresses = table.value.state.addresses;
        alt.readonlyIndexes.forEach((idx) => {
          loadedAddresses.readonly.push(altAddresses[idx]);
        });
        alt.writableIndexes.forEach((idx) => {
          loadedAddresses.writable.push(altAddresses[idx]);
        });
      }
    }
  }

  const accounts: AccountMeta[] = parseTransactionAccounts(tx.message, loadedAddresses);

  if (isSealedTransaction(accounts)) {
    return tx;
  }

  const instructions: TransactionInstruction[] = (
    tx.message.compiledInstructions
      ? tx.message.compiledInstructions
      : (tx.message as Message).instructions
  )
    .map((instruction) => compiledInstructionToInstruction(instruction, accounts))
    .filter((instruction) => !instruction.programId.equals(MAE_PROGRAM_ID));

  const args: AttributeInstructionArgs = {
    attributeParams: {
      memo: JSON.stringify({ auctionHouse: config.auctionHouse }),
    },
  };

  const attrIx = createAttributeInstruction(args);
  const { blockhash } = await connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: blockhash,
    instructions: instructions.concat(attrIx),
  }).compileToV0Message(alts);

  const transactionV0 = new VersionedTransaction(messageV0);
  return transactionV0;
}

function handleError(error: string) {
  if (error.indexOf('insufficient funds') > -1) {
    toast("You don't have enough SOL to buy this NFT.", { type: 'error' });
  }
}

export default function useAttributedBuyNow(): AttributedBuyContext {
  const wallet = useWalletContext();
  const { connection } = useConnection();
  const [buying, setBuying] = useState<boolean>(false);

  const onAttributedBuyNow = async ({
    nft,
    listing,
  }: AttributedBuyParams): Promise<BuyListingResponse | undefined> => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction || !nft || !listing) {
      throw new Error('not all params provided');
    }

    setBuying(true);

    const { buffer: buyNowTxBuffer, error: error } = await getBuyNowTransaction(
      listing.auctionHouseProgram,
      listing.auctionHouseAddress,
      listing.userAddress,
      wallet.publicKey.toBase58(),
      listing.price,
      nft.mintAddress
    );

    if (error) {
      handleError(error);
    } else if (!!buyNowTxBuffer) {
      try {
        const tx = await versionedTransactionFromBuyBuffer(
          connection,
          wallet.publicKey,
          buyNowTxBuffer
        );

        const { txid } = await sendVersionedTransactionWithRetry(connection, wallet, tx);

        if (!!txid) {
          // eslint-disable-next-line no-console
          console.log('Buynow signature: ', txid);

          return {
            buyAction: {
              auctionHouseAddress: config.auctionHouse,
              auctionHouseProgram: config.auctionHouseProgram ?? '',
              blockTimestamp: Math.floor(new Date().getTime() / 1000),
              price: listing.price,
              signature: txid,
              userAddress: wallet.publicKey.toBase58(),
            },
          };
        }
      } catch (ex) {
        console.log(ex);
      } finally {
        setBuying(false);
      }
    }

    setBuying(false);
  };

  return {
    buying,
    onAttributedBuyNow,
  };
}
