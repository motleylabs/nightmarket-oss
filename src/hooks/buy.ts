import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import {
  FormState,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { AhListing, Marketplace, Nft } from '../graphql.types';
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
import {
  findAuctioneer,
  findListingAddress,
  findOfferAddress,
  findPurchaseTicketAddress,
  findRewardCenter,
} from '../modules/reward-center/pdas';
import config from '../app.config';

interface BuyForm {
  amount?: number;
}

interface BuyListedForm extends BuyForm {
  nft: Nft;
  marketplace: Marketplace;
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
  onBuyNow: ({ amount, nft, marketplace }: BuyListedForm) => Promise<void>;
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

  const onBuyNow = async ({ nft, marketplace, ahListing }: BuyListedForm) => {
    if (connected && publicKey && signTransaction && nft.owner?.address) {
      // TODO buy flow
      const ah = marketplace.auctionHouses[0];
      const auctionHouse = new PublicKey(ah.address);
      const listedPrice = ahListing.price.toNumber();
      const seller = new PublicKey(nft?.owner?.address);
      const authority = new PublicKey(ah.authority);
      const ahFeeAcc = new PublicKey(ah.auctionHouseFeeAccount);
      const auctionHouseTreasury = new PublicKey(ah.auctionHouseTreasury);
      const sellerTradeState = new PublicKey(ahListing.tradeState);
      const sellerTradeStateBump = ahListing.tradeStateBump;
      const treasuryMint = new PublicKey(ah.treasuryMint);
      const tokenMint = new PublicKey(nft.mintAddress);
      const metadata = new PublicKey(nft.address);
      const associatedTokenAcc = new PublicKey(nft.owner!.associatedTokenAccountAddress);

      const [buyerTradeState, buyerTradeStateBump] =
        await AuctionHouseProgram.findPublicBidTradeStateAddress(
          publicKey,
          auctionHouse,
          treasuryMint,
          tokenMint,
          listedPrice,
          1
        );

      const [escrowPaymentAccount, escrowPaymentBump] =
        await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouse, publicKey);

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
          auctionHouse,
          associatedTokenAcc,
          treasuryMint,
          tokenMint,
          0,
          1
        );

      const [rewardCenter] = await findRewardCenter(auctionHouse);
      const [listing] = await findListingAddress(seller, metadata, rewardCenter);
      const [offer] = await findOfferAddress(publicKey, metadata, rewardCenter);
      const [auctioneer] = await findAuctioneer(auctionHouse, rewardCenter);
      const [purchaseTicket] = await findPurchaseTicketAddress(listing, offer);

      const token = new PublicKey(config.rewardCenter.token);

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
        purchaseTicket,
        tokenAccount: associatedTokenAcc,
        tokenMint,
        metadata,
        treasuryMint,
        sellerPaymentReceiptAccount,
        buyerReceiptTokenAccount,
        authority,
        escrowPaymentAccount,
        auctionHouse,
        auctionHouseFeeAccount: ahFeeAcc,
        auctionHouseTreasury,
        sellerTradeState,
        buyerTradeState,
        freeSellerTradeState,
        rewardCenter,
        rewardCenterRewardTokenAccount: new PublicKey(config.rewardCenter.ata), // TODO
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
          price: listedPrice,
          tokenSize: 1,
        },
      };

      const instruction = createExecuteSaleInstruction(accounts, args);
      const tx = new Transaction();

      tx.add(buyerATAInstruction);
      tx.add(sellerATAInstruction);
      tx.add(instruction);
      const recentBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = recentBlockhash.blockhash;
      tx.feePayer = publicKey;

      try {
        const signedTx = await signTransaction(tx);
        const txtId = await connection.sendRawTransaction(signedTx.serialize());
        if (txtId) {
          await connection.confirmTransaction(txtId, 'confirmed');
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
