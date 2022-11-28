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
} from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { RewardCenterProgram } from '../modules/reward-center';
import useViewer from './viewer';

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
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const viewer = useViewer();
  const [buy, setBuy] = useState(false);
  const [buying, setBuying] = useState(false);

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
    const listedPrice = parseInt(ahListing.price);
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

    const tx = new Transaction();

    const buyerAtAInfo = await connection.getAccountInfo(buyerRewardTokenAccount);

    const keys = buyListingIx.keys.concat(remainingAccounts);

    const ix = ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 });
    tx.add(ix);

    if (!buyerAtAInfo) {
      tx.add(buyerATAInstruction);
    }

    tx.add(
      new TransactionInstruction({
        programId: RewardCenterProgram.PUBKEY,
        data: buyListingIx.data,
        keys,
      })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;

    try {
      const signedTx = await signTransaction(tx);
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

      toast('Nft purchased', { type: 'success' });

      return { buyerReceiptTokenAccount };
    } catch (err: any) {
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
