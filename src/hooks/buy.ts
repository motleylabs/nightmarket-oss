import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import { AhListing, AuctionHouse, Nft } from '../graphql.types';
import useLogin from './login';
import { NftMarketInfoQuery, NftDetailsQuery } from './../queries/nft.graphql';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import {
  createBuyListingInstruction,
  BuyListingInstructionAccounts,
  BuyListingInstructionArgs,
} from '@holaplex/hpl-reward-center';
import { toast } from 'react-toastify';
import {
  PublicKey,
  Transaction,
  AccountMeta,
  TransactionInstruction,
  ComputeBudgetProgram,
  AddressLookupTableProgram,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
  Signer,
} from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { RewardCenterProgram } from '../modules/reward-center';
import useViewer from './viewer';
import { notifyInstructionError } from '../modules/bugsnag';
import config from '../app.config';
import { useCachedBuddy } from './referrals';
import { queueVersionedTransactionSign } from '../utils/transactions';
import { TX_INTERVAL } from './list';
import { reduceSettledPromise } from '../utils/promises';

interface BuyForm {
  amount?: number;
}

interface BuyListedForm extends BuyForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
  ahListing: AhListing;
}

interface BuyListingResponse {
  buyerReceiptTokenAccount: PublicKey;
}

interface BuyContext {
  buy: boolean;
  buying: boolean;
  onBuyNow: ({
    amount,
    nft,
    auctionHouse,
  }: BuyListedForm) => Promise<BuyListingResponse | undefined>;
  onOpenBuy: () => void;
  onCloseBuy: () => void;
}

export default function useBuyNow(): BuyContext {
  const wallet = useWallet();
  const { connected, publicKey, signTransaction, signAllTransactions } = wallet;
  const { connection } = useConnection();
  const viewer = useViewer();
  const [buy, setBuy] = useState(false);
  const [buying, setBuying] = useState(false);

  const { linkBuddy } = useCachedBuddy({
    wallet: wallet.publicKey?.toString()!,
  });

  const onBuyNow = async ({ nft, auctionHouse, ahListing }: BuyListedForm) => {
    if (
      !connected ||
      !publicKey ||
      !signTransaction ||
      !nft ||
      !nft.owner ||
      !auctionHouse.rewardCenter ||
      !viewer
    ) {
      throw new Error('not all params provided');
    }

    setBuying(true);
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const listedPrice = parseFloat(ahListing.price);
    const seller = new PublicKey(nft?.owner?.address);
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const auctionHouseTreasury = new PublicKey(auctionHouse.auctionHouseTreasury);
    const sellerTradeState = new PublicKey(ahListing.tradeState);
    const sellerTradeStateBump = ahListing.tradeStateBump;
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const associatedTokenAcc = new PublicKey(nft.owner.associatedTokenAccountAddress);
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

    const buyerReceiptTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      publicKey
    );

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

    const rewardCenterRewardTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      rewardCenter,
      true
    );

    const buyerRewardTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      publicKey
    );

    const buyerATAInstruction = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      buyerRewardTokenAccount,
      publicKey,
      publicKey
    );

    const sellerRewardTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      seller
    );

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

    for (let creator of nft.creators) {
      const creatorAccount = {
        pubkey: new PublicKey(creator.address),
        isSigner: false,
        isWritable: true,
      };
      remainingAccounts = [...remainingAccounts, creatorAccount];
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

    const transactions: VersionedTransaction[] = [];
    try {
      const signedBuddyTx = await linkBuddy();
      if (signedBuddyTx) transactions.push(signedBuddyTx);
    } catch (e) {}

    try {
      const { blockhash } = await connection.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: arrayOfInstructions,
      }).compileToV0Message([lookupTableAccount!]);

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
      }

      return { buyerReceiptTokenAccount };
    } catch (err: any) {
      notifyInstructionError(err, {
        operation: 'NFT purchased',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: err.logs,
          nft,
        },
      });
      toast(err.message, { type: 'error' });

      throw err;
    } finally {
      setBuying(false);
      setBuy(false);
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
