import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import type {
  BuyListingInstructionAccounts,
  BuyListingInstructionArgs,
} from '@motleylabs/mtly-reward-center';
import { createBuyListingInstruction } from '@motleylabs/mtly-reward-center';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import type { AccountMeta, AddressLookupTableAccount } from '@solana/web3.js';
import {
  PublicKey,
  TransactionInstruction,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import config from '../app.config';
import { notifyInstructionError } from '../modules/bugsnag';
import { RewardCenterProgram } from '../modules/reward-center';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { AuctionHouse } from '../typings';
import type { ActionInfo, ErrorWithLogs, Nft } from '../typings';
import { getPNFTAccounts, getMetadataAccount } from '../utils/metaplex';
import { AuctionHouseProgram } from '../utils/mtly-house';
import { reduceSettledPromise } from '../utils/promises';
import { queueVersionedTransactionSign } from '../utils/transactions';
import { TX_INTERVAL } from './list';
import { useCachedBuddy } from './referrals';

interface BuyForm {
  amount?: number;
}

interface BuyListedForm extends BuyForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
  listing: ActionInfo;
}

interface BuyListingResponse {
  buyerReceiptTokenAccount: PublicKey;
  buyAction: ActionInfo | null;
}

interface BuyContext {
  buy: boolean;
  buying: boolean;
  onBuyNow: ({
    listing,
    nft,
    auctionHouse,
  }: BuyListedForm) => Promise<BuyListingResponse | undefined>;
  onOpenBuy: () => void;
  onCloseBuy: () => void;
}

export default function useBuyNow(): BuyContext {
  const { connected, publicKey, address, signTransaction, signAllTransactions } =
    useWalletContext();
  const { connection } = useConnection();
  const [buy, setBuy] = useState(false);
  const [buying, setBuying] = useState(false);

  const { linkBuddy } = useCachedBuddy({
    wallet: address as string,
  });

  const onBuyNow = async ({
    nft,
    auctionHouse,
    listing: curListing,
  }: BuyListedForm): Promise<BuyListingResponse | undefined> => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !nft ||
      !nft.owner ||
      !auctionHouse.rewardCenter
    ) {
      toast('Required data is missing to take buyNow action', { type: 'error' });
      throw new Error('not all params provided');
    }

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const associatedTokenAcc = getAssociatedTokenAddressSync(tokenMint, new PublicKey(nft.owner));

    // find bump
    const [sellerTradeState, sellerTradeStateBump] =
      await RewardCenterProgram.findAuctioneerTradeStateAddress(
        new PublicKey(nft.owner),
        auctionHouseAddress,
        associatedTokenAcc,
        treasuryMint,
        tokenMint,
        1
      );

    if (!!curListing.tradeState && sellerTradeState.toBase58() !== curListing.tradeState) {
      throw new Error('trade state address does not match');
    }

    setBuying(true);
    const listedPrice = Number(curListing.price);
    const seller = new PublicKey(nft.owner);
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const auctionHouseTreasury = new PublicKey(auctionHouse.auctionHouseTreasury);

    const metadata = getMetadataAccount(tokenMint);
    const token = new PublicKey(auctionHouse?.rewardCenter?.tokenMint);

    const [buyerTradeState, buyerTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        listedPrice,
        1
      );

    const [escrowPaymentAccount, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const buyerReceiptTokenAccount = await getAssociatedTokenAddress(tokenMint, publicKey);

    const [programAsSigner, programAsSignerBump] =
      await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

    const [freeSellerTradeState, freeSellerTradeBump] =
      await AuctionHouseProgram.findTradeStateAddress(
        seller,
        auctionHouseAddress,
        associatedTokenAcc,
        treasuryMint,
        tokenMint,
        0,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);
    const [listing] = await RewardCenterProgram.findListingAddress(seller, metadata, rewardCenter);

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const rewardCenterRewardTokenAccount = await getAssociatedTokenAddress(
      token,
      rewardCenter,
      true
    );

    const buyerRewardTokenAccount = await getAssociatedTokenAddress(token, publicKey);

    const buyerATAInstruction = createAssociatedTokenAccountInstruction(
      publicKey,
      buyerRewardTokenAccount,
      publicKey,
      token
    );

    const sellerRewardTokenAccount = await getAssociatedTokenAddress(token, seller);

    const accounts: BuyListingInstructionAccounts = {
      buyer: publicKey,
      buyerRewardTokenAccount,
      seller,
      sellerRewardTokenAccount,
      listing,
      tokenAccount: associatedTokenAcc,
      paymentAccount: publicKey,
      transferAuthority: publicKey,
      tokenMint,
      metadata,
      treasuryMint,
      sellerPaymentReceiptAccount: seller,
      buyerReceiptTokenAccount,
      authority,
      escrowPaymentAccount,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      auctionHouseTreasury,
      sellerTradeState,
      buyerTradeState,
      freeSellerTradeState,
      rewardCenter,
      rewardCenterRewardTokenAccount,
      ahAuctioneerPda: auctioneer,
      programAsSigner,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const args: BuyListingInstructionArgs = {
      buyListingParams: {
        escrowPaymentBump,
        freeTradeStateBump: freeSellerTradeBump,
        sellerTradeStateBump,
        programAsSignerBump,
        buyerTradeStateBump,
      },
    };

    const arrayOfInstructions = new Array<TransactionInstruction>();

    const lookupTableAccount = await connection
      .getAddressLookupTable(new PublicKey(config.addressLookupTable))
      .then((res) => res.value);

    const buyListingIx = createBuyListingInstruction(accounts, args);

    let remainingAccounts: AccountMeta[] = [];

    // find NFT creators
    const metadataAccountInfo = await connection.getAccountInfo(metadata);
    if (!!metadataAccountInfo) {
      const metadataInfo = Metadata.deserialize(metadataAccountInfo.data as Buffer, 0)[0];
      if (!!metadataInfo.data.creators) {
        for (const creator of metadataInfo.data.creators) {
          const creatorAccount = {
            pubkey: new PublicKey(creator.address),
            isSigner: false,
            isWritable: true,
          };
          remainingAccounts = [...remainingAccounts, creatorAccount];
        }
      }
    }

    if (nft.tokenStandard === 'ProgrammableNonFungible') {
      const pnftAccounts = await getPNFTAccounts(
        connection,
        publicKey,
        programAsSigner,
        tokenMint,
        seller
      );

      remainingAccounts.push(pnftAccounts.metadataProgram);
      remainingAccounts.push(pnftAccounts.edition);
      remainingAccounts.push(pnftAccounts.sellerTokenRecord);
      remainingAccounts.push(pnftAccounts.tokenRecord);
      remainingAccounts.push(pnftAccounts.authRulesProgram);
      remainingAccounts.push(pnftAccounts.authRules);
      remainingAccounts.push(pnftAccounts.sysvarInstructions);
    }

    const buyerAtAInfo = await connection.getAccountInfo(buyerRewardTokenAccount);

    // patch metadata account to writable for AH / RWD
    for (let i = 0; i < buyListingIx.keys.length; i++) {
      if (buyListingIx.keys[i].pubkey.equals(metadata)) {
        buyListingIx.keys[i].isWritable = true;
      }
    }

    const keys = buyListingIx.keys.concat(remainingAccounts);

    const ix = ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 });
    arrayOfInstructions.push(ix);

    if (!buyerAtAInfo) {
      arrayOfInstructions.push(buyerATAInstruction);
    }

    arrayOfInstructions.push(
      new TransactionInstruction({
        programId: RewardCenterProgram.PUBKEY,
        data: buyListingIx.data,
        keys,
      })
    );

    let buyTxIndex = 0;
    const transactions: VersionedTransaction[] = [];
    try {
      const signedBuddyTx = await linkBuddy();
      if (signedBuddyTx) {
        transactions.push(signedBuddyTx);
        buyTxIndex = 1;
      }
    } catch (e) {}

    let buyAction: ActionInfo | null = null;
    try {
      const { blockhash } = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: arrayOfInstructions,
      }).compileToV0Message([lookupTableAccount as AddressLookupTableAccount]);

      const transactionV0 = new VersionedTransaction(messageV0);

      transactions.push(transactionV0);

      const pendingSigned = await queueVersionedTransactionSign({
        transactions,
        signAllTransactions,
        signTransaction,
        connection,
        txInterval: TX_INTERVAL,
      });

      const settledSignedTxs = reduceSettledPromise(pendingSigned);

      if (settledSignedTxs.rejected.length > 0) {
        throw settledSignedTxs.rejected[0];
      }

      if (settledSignedTxs.fulfilled.length > 0) {
        toast('NFT purchased', { type: 'success' });

        if (buyTxIndex < settledSignedTxs.fulfilled.length) {
          const blockTimestamp = Math.floor(new Date().getTime() / 1000);

          buyAction = {
            auctionHouseAddress: auctionHouseAddress.toBase58(),
            auctionHouseProgram: config.auctionHouseProgram ?? '',
            blockTimestamp,
            price: curListing.price,
            signature: settledSignedTxs.fulfilled[buyTxIndex],
            userAddress: publicKey?.toBase58() ?? '',
          };
        }
      }
    } catch (err: unknown) {
      const error = err as ErrorWithLogs;

      notifyInstructionError(error, {
        operation: 'NFT purchased',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: error.logs,
          nft,
        },
      });
      toast(error.message, { type: 'error' });

      throw err;
    } finally {
      setBuying(false);
      setBuy(false);
      return { buyerReceiptTokenAccount, buyAction };
    }
  };

  const onOpenBuy = useCallback(() => {
    setBuy(true);
  }, [setBuy]);

  const onCloseBuy = useCallback(() => {
    setBuy(false);
  }, [setBuy]);

  return {
    buy,
    buying,
    onBuyNow,
    onOpenBuy,
    onCloseBuy,
  };
}
