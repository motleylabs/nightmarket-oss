import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import {
  FormState,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { AhListing, AuctionHouse, Nft } from '../graphql.types';
import useLogin from './login';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import {
  createExecuteSaleInstruction,
  ExecuteSaleInstructionAccounts,
  ExecuteSaleInstructionArgs,
} from '@holaplex/hpl-reward-center';
import { PublicKey, Transaction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { RewardCenterProgram } from '../modules/reward-center';

interface BuyForm {
  amount?: number;
}

interface BuyListedForm extends BuyForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
  ahListing: AhListing;
}

const schema = zod.object({
  amount: zod
    .string()
    .min(1, `Must enter an amount`)
    .regex(/^[0-9.]*$/, { message: `Must be a number` }),
});

interface BuyContext {
  buy: boolean;
  registerBuy: UseFormRegister<BuyForm>;
  handleSubmitBuy: UseFormHandleSubmit<BuyForm>;
  setValue: UseFormSetValue<BuyForm>;
  onBuyNow: ({ amount, nft, auctionHouse }: BuyListedForm) => Promise<void>;
  onOpenBuy: () => void;
  onCloseBuy: () => void;
  buyFormState: FormState<BuyForm>;
}

export default function useBuyNow(): BuyContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const login = useLogin();
  const [buy, setBuy] = useState(false);
  const {
    register: registerBuy,
    handleSubmit: handleSubmitBuy,
    reset,
    formState: buyFormState,
    setValue,
  } = useForm<BuyForm>({
    resolver: zodResolver(schema),
  });

  const onBuyNow = async ({ nft, auctionHouse, ahListing }: BuyListedForm) => {
    if (
      connected &&
      publicKey &&
      signTransaction &&
      nft.owner?.address &&
      auctionHouse.rewardCenter
    ) {
      // TODO buy flow

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
      const associatedTokenAcc = new PublicKey(nft.owner!.associatedTokenAccountAddress);

      const [buyerTradeState, _buyerTradeStateBump] =
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

      let sellerPaymentReceiptAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        treasuryMint,
        seller
      );

      const [buyerReceiptTokenAccount] =
        await AuctionHouseProgram.findAssociatedTokenAccountAddress(tokenMint, publicKey);

      const [programAsSigner, programAsSignerBump] =
        await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

      const [freeSellerTradeState, freeSellerTradeBump] =
        await AuctionHouseProgram.findTradeStateAddress(
          publicKey,
          auctionHouseAddress,
          associatedTokenAcc,
          treasuryMint,
          tokenMint,
          0,
          1
        );

      const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);
      const [listing] = await RewardCenterProgram.findListingAddress(
        seller,
        metadata,
        rewardCenter
      );
      const [offer] = await RewardCenterProgram.findOfferAddress(publicKey, metadata, rewardCenter);
      const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
        auctionHouseAddress,
        rewardCenter
      );
      const [purchaseTicket] = await RewardCenterProgram.findPurchaseTicketAddress(listing, offer);
      const rewardCenterRewardTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(auctionHouse.rewardCenter.tokenMint),
        rewardCenter,
        true
      );

      const token = new PublicKey(auctionHouse?.rewardCenter?.tokenMint);

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

      const sellerATAInstruction = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        token,
        sellerRewardTokenAccount,
        seller,
        publicKey
      );

      const accounts: ExecuteSaleInstructionAccounts = {
        buyer: publicKey,
        buyerRewardTokenAccount,
        seller,
        sellerRewardTokenAccount,
        listing,
        offer,
        payer: publicKey,
        tokenAccount: associatedTokenAcc,
        tokenMint,
        metadata,
        treasuryMint,
        sellerPaymentReceiptAccount,
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

      const args: ExecuteSaleInstructionArgs = {
        executeSaleParams: {
          escrowPaymentBump,
          freeTradeStateBump: freeSellerTradeBump,
          sellerTradeStateBump,
          programAsSignerBump,
        },
      };

      const instruction = createExecuteSaleInstruction(accounts, args);
      const tx = new Transaction();

      const buyerAtAInfo = await connection.getAccountInfo(buyerRewardTokenAccount);
      const sellerAtAInfo = await connection.getAccountInfo(sellerRewardTokenAccount);

      if (!buyerAtAInfo) {
        tx.add(buyerATAInstruction);
      }

      if (!sellerAtAInfo) {
        tx.add(sellerATAInstruction);
      }

      tx.add(instruction);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      try {
        const signedTx = await signTransaction(tx);
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        if (signature) {
          await connection.confirmTransaction(
            {
              blockhash,
              lastValidBlockHeight,
              signature,
            },
            'confirmed'
          );
          console.log(`confirmed`);
        }
      } catch (err) {
        console.log('Error whilst purchasing from a listing', err);
      } finally {
        setBuy(true);
      }
    } else {
      return login();
    }
  };

  const onOpenBuy = useCallback(() => {
    setBuy(true);
  }, [setBuy]);

  const onCloseBuy = useCallback(() => {
    reset();
    setBuy(false);
  }, [setBuy, reset]);

  return {
    registerBuy,
    setValue,
    buyFormState,
    buy,
    onBuyNow,
    onOpenBuy,
    onCloseBuy,
    handleSubmitBuy,
  };
}
