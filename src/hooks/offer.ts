import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { useEffect } from 'react';
import useLogin from './login';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AuctionHouse, Maybe, Nft, Offer } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import {
  createCreateOfferInstruction,
  CreateOfferInstructionAccounts,
  CreateOfferInstructionArgs,
  createCloseOfferInstruction,
  CloseOfferInstructionAccounts,
  CloseOfferInstructionArgs,
} from '@holaplex/hpl-reward-center';
import { PublicKey, Transaction } from '@solana/web3.js';
import { toLamports } from '../modules/sol';
import { RewardCenterProgram } from '../modules/reward-center';
import { toast } from 'react-toastify';

interface OfferForm {
  amount: string;
}

interface MakeOfferForm extends OfferForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

const schema = zod.object({
  amount: zod
    .string()
    .min(1, `Must enter an amount`)
    .regex(/^[0-9.]*$/, { message: `Must be a number` }),
});

interface MakeOfferContext {
  makeOffer: boolean;
  registerOffer: UseFormRegister<OfferForm>;
  handleSubmitOffer: UseFormHandleSubmit<OfferForm>;
  onMakeOffer: ({ amount, nft, auctionHouse }: MakeOfferForm) => Promise<void>;
  onOpenOffer: () => void;
  onCancelMakeOffer: () => void;
  offerFormState: FormState<OfferForm>;
}

export function useMakeOffer(): MakeOfferContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const login = useLogin();
  const [makeOffer, setMakeOffer] = useState(false);
  const {
    register: registerOffer,
    handleSubmit: handleSubmitOffer,
    reset,
    formState: offerFormState,
  } = useForm<OfferForm>({
    resolver: zodResolver(schema),
  });

  const onMakeOffer = async ({ amount, nft, auctionHouse }: MakeOfferForm) => {
    if (!connected || !publicKey || !signTransaction) {
      return;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const offerPrice = toLamports(Number(amount));
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const associatedTokenAcc = new PublicKey(nft.owner!.associatedTokenAccountAddress);

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [buyerTradeState, buyerTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        offerPrice,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);
    const [offer] = await RewardCenterProgram.findOfferAddress(publicKey, metadata, rewardCenter);
    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CreateOfferInstructionAccounts = {
      wallet: publicKey,
      offer,
      paymentAccount: publicKey,
      transferAuthority: publicKey,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      metadata,
      escrowPaymentAccount: escrowPaymentAcc,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      buyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const args: CreateOfferInstructionArgs = {
      createOfferParams: {
        tradeStateBump: buyerTradeStateBump,
        escrowPaymentBump,
        buyerPrice: offerPrice,
        tokenSize: 1,
      },
    };

    const instruction = createCreateOfferInstruction(accounts, args);
    const tx = new Transaction();
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
      }
      toast('You offer is in', { type: 'success' });
    } catch (err: any) {
      toast(err.message, { type: 'error' });
    } finally {
      setMakeOffer(true);
    }
  };

  const onOpenOffer = useCallback(() => {
    if (connected) {
      setMakeOffer(true);
    }
    login();
  }, [setMakeOffer, login, connected]);

  const onCancelMakeOffer = useCallback(() => {
    setMakeOffer(true);
  }, [setMakeOffer]);

  return {
    registerOffer,
    offerFormState,
    makeOffer,
    onOpenOffer,
    onMakeOffer,
    handleSubmitOffer,
    onCancelMakeOffer,
  };
}

interface UpdateOfferContext {
  updateOffer: boolean;
  registerUpdateOffer: UseFormRegister<OfferForm>;
  handleSubmitUpdateOffer: UseFormHandleSubmit<OfferForm>;
  onUpdateOffer: ({ amount, nft, auctionHouse }: MakeOfferForm) => Promise<void>;
  onOpenUpdateOffer: () => void;
  onCancelUpdateOffer: () => void;
  updateOfferFormState: FormState<OfferForm>;
}

export function useUpdateOffer(offer: Maybe<Offer> | undefined): UpdateOfferContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const login = useLogin();
  const [updateOffer, setUpdateOffer] = useState(false);
  const {
    register: registerUpdateOffer,
    handleSubmit: handleSubmitUpdateOffer,
    reset,
    formState: updateOfferFormState,
  } = useForm<OfferForm>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset({
      amount: offer?.solPrice?.toString(),
    });
  }, [offer?.solPrice, reset]);

  const onUpdateOffer = async ({ amount, nft, auctionHouse }: MakeOfferForm) => {
    if (!connected || !publicKey || !signTransaction || !offer) {
      return;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const newOfferPrice = toLamports(Number(amount));
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const associatedTokenAcc = new PublicKey(nft.owner!.associatedTokenAccountAddress);

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [buyerTradeState, _tradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        Number(offer.price),
        1
      );

    const [updatedBuyerTradeState, updatedTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        newOfferPrice,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [rewardsOffer] = await RewardCenterProgram.findOfferAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const [buyerReceiptTokenAccount] = await AuctionHouseProgram.findAssociatedTokenAccountAddress(
      tokenMint,
      publicKey
    );

    const closeOfferAccounts: CloseOfferInstructionAccounts = {
      wallet: publicKey,
      offer: rewardsOffer,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      receiptAccount: buyerReceiptTokenAccount,
      escrowPaymentAccount: escrowPaymentAcc,
      metadata,
      tokenMint,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      tradeState: buyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const closeOfferArgs: CloseOfferInstructionArgs = {
      closeOfferParams: {
        escrowPaymentBump,
      },
    };

    const closeOfferIx = createCloseOfferInstruction(closeOfferAccounts, closeOfferArgs);

    const createofferAccounts: CreateOfferInstructionAccounts = {
      wallet: publicKey,
      offer: rewardsOffer,
      paymentAccount: publicKey,
      transferAuthority: publicKey,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      metadata,
      escrowPaymentAccount: escrowPaymentAcc,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      buyerTradeState: updatedBuyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const createOfferArgs: CreateOfferInstructionArgs = {
      createOfferParams: {
        tradeStateBump: updatedTradeStateBump,
        escrowPaymentBump,
        buyerPrice: newOfferPrice,
        tokenSize: 1,
      },
    };

    const createOfferIx = createCreateOfferInstruction(createofferAccounts, createOfferArgs);

    const tx = new Transaction();
    tx.add(closeOfferIx);
    tx.add(createOfferIx);
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
        toast('Offer updated', { type: 'success' });
      }
    } catch (err: any) {
      toast(err.message, { type: 'error' });
    } finally {
      setUpdateOffer(true);
    }
  };

  const onOpenUpdateOffer = useCallback(() => {
    if (connected) {
      setUpdateOffer(true);
    }
    login();
  }, [setUpdateOffer, login, connected]);

  const onCancelUpdateOffer = useCallback(() => {
    setUpdateOffer(false);
  }, [setUpdateOffer]);

  return {
    updateOffer,
    registerUpdateOffer,
    updateOfferFormState,
    onUpdateOffer,
    handleSubmitUpdateOffer,
    onOpenUpdateOffer,
    onCancelUpdateOffer,
  };
}

interface CancelOfferContext {
  closingOffer: boolean;
  onCloseOffer: (payload: {
    nft: Maybe<Nft> | undefined;
    auctionHouse: Maybe<AuctionHouse> | undefined;
  }) => Promise<void>;
}

export function useCloseOffer(offer: Maybe<Offer> | undefined): CancelOfferContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const login = useLogin();
  const [closingOffer, setClosingOffer] = useState(false);

  const onCloseOffer = async ({
    nft,
    auctionHouse,
  }: {
    nft: Maybe<Nft> | undefined;
    auctionHouse: Maybe<AuctionHouse> | undefined;
  }) => {
    if (!connected || !publicKey || !signTransaction) {
      login();
      return;
    }

    if (!auctionHouse || !offer || !nft) {
      return;
    }
    setClosingOffer(true);
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const associatedTokenAcc = new PublicKey(nft.owner!.associatedTokenAccountAddress);

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [buyerReceiptTokenAccount] = await AuctionHouseProgram.findAssociatedTokenAccountAddress(
      tokenMint,
      publicKey
    );

    const [buyerTradeState, _tradeStateBump] = await AuctionHouseProgram.findTradeStateAddress(
      publicKey,
      auctionHouseAddress,
      associatedTokenAcc,
      treasuryMint,
      tokenMint,
      Number(offer.price),
      1
    );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [rewardsOffer] = await RewardCenterProgram.findOfferAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CloseOfferInstructionAccounts = {
      wallet: publicKey,
      offer: rewardsOffer,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      receiptAccount: buyerReceiptTokenAccount,
      escrowPaymentAccount: escrowPaymentAcc,
      metadata,
      tokenMint,
      authority,
      rewardCenter,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: ahFeeAcc,
      tradeState: buyerTradeState,
      ahAuctioneerPda: auctioneer,
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
    };

    const args: CloseOfferInstructionArgs = {
      closeOfferParams: {
        escrowPaymentBump,
      },
    };

    const instruction = createCloseOfferInstruction(accounts, args);
    const tx = new Transaction();
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
        toast('Offer canceled', { type: 'success' });
      }
    } catch (err: any) {
      console.log('Error whilst closing offer', err);
      toast(err.message, { type: 'error' });
    } finally {
      setClosingOffer(false);
    }
  };

  return {
    closingOffer,
    onCloseOffer,
  };
}
