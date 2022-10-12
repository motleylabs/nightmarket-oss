import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import useLogin from './login';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AuctionHouse, Nft, Offer } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import {
  createCreateOfferInstruction,
  CreateOfferInstructionAccounts,
  CreateOfferInstructionArgs,
  createUpdateOfferInstruction,
  UpdateOfferInstructionAccounts,
  UpdateOfferInstructionArgs,
  createCancelOfferInstruction,
  CancelOfferInstructionAccounts,
  CancelOfferInstructionArgs,
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

interface CancelOfferForm extends MakeOfferForm {
  ahOffer: Offer;
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
  onUpdateOffer: ({ amount, nft, auctionHouse }: MakeOfferForm) => Promise<void>;
  onCancelOffer: ({ amount, nft, auctionHouse, ahOffer }: CancelOfferForm) => Promise<void>;
  onOpenOffer: () => void;
  onCloseOffer: () => void;
  offerFormState: FormState<OfferForm>;
}

export default function useMakeOffer(): MakeOfferContext {
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
    if (connected && publicKey && signTransaction) {
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
      const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(auctionHouseAddress, rewardCenter);

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
        toast('You offer is in')
      } catch (err) {
        console.log('Error whilst making offer', err);
      } finally {
        setMakeOffer(true);
      }
    } else {
      return login();
    }
  };

  const onUpdateOffer = async ({ amount, nft, auctionHouse }: MakeOfferForm) => {
    if (connected && publicKey && signTransaction) {
      const auctionHouseAddress = new PublicKey(auctionHouse.address);
      const newOfferPrice = toLamports(Number(amount));
      const authority = new PublicKey(auctionHouse.authority);
      const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
      const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
      const tokenMint = new PublicKey(nft.mintAddress);
      const metadata = new PublicKey(nft.address);
      const associatedTokenAcc = new PublicKey(nft.owner!.associatedTokenAccountAddress);

      const [programAsSigner, programAsSignerBump] =
        await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

      const [escrowPaymentAcc, escrowPaymentBump] =
        await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

      const [buyerTradeState, buyerTradeStateBump] =
        await AuctionHouseProgram.findPublicBidTradeStateAddress(
          publicKey,
          auctionHouseAddress,
          treasuryMint,
          tokenMint,
          newOfferPrice,
          1
        );

      const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

      const [offer] = await RewardCenterProgram.findOfferAddress(publicKey, metadata, rewardCenter);

      const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(auctionHouseAddress, rewardCenter);

      const accounts: UpdateOfferInstructionAccounts = {
        wallet: publicKey,
        offer,
        rewardCenter,
        buyerTokenAccount: associatedTokenAcc,
        auctionHouse: auctionHouseAddress,
        authority,
        transferAuthority: publicKey,
        treasuryMint,
        tokenAccount: associatedTokenAcc,
        auctionHouseFeeAccount: ahFeeAcc,
        metadata,
        escrowPaymentAccount: escrowPaymentAcc,
        ahAuctioneerPda: auctioneer,
        auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      };

      const args: UpdateOfferInstructionArgs = {
        updateOfferParams: {
          newBuyerPrice: newOfferPrice,
          escrowPaymentBump,
        },
      };

      const instruction = createUpdateOfferInstruction(accounts, args);
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
          console.log(`confirmed`);
        }
      } catch (err) {
        console.error(`Error whilst updating offer`, err);
      } finally {
        setMakeOffer(true);
      }
    } else {
      return login();
    }
  };

  const onCancelOffer = async ({ amount, nft, auctionHouse }: CancelOfferForm) => {
    if (connected && publicKey && signTransaction) {
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

      const [buyerReceiptTokenAccount] =
        await AuctionHouseProgram.findAssociatedTokenAccountAddress(tokenMint, publicKey);

      const [sellerTradeState, tradeStateBump] = await AuctionHouseProgram.findTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        associatedTokenAcc,
        treasuryMint,
        tokenMint,
        0,
        1
      );

      const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

      const [offer] = await RewardCenterProgram.findOfferAddress(publicKey, metadata, rewardCenter);

      const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(auctionHouseAddress, rewardCenter);

      const accounts: CancelOfferInstructionAccounts = {
        wallet: publicKey,
        offer,
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
        tradeState: sellerTradeState,
        ahAuctioneerPda: auctioneer,
        auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      };

      const args: CancelOfferInstructionArgs = {
        cancelOfferParams: {
          tradeStateBump,
          escrowPaymentBump,
          buyerPrice: offerPrice,
          tokenSize: 1,
        },
      };

      const instruction = createCancelOfferInstruction(accounts, args);
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
          console.log(`confirmed`);
        }
      } catch (err) {
        console.log('Error whilst closing offer', err);
      } finally {
        setMakeOffer(true);
      }
    } else {
      login();
    }
  };

  const onOpenOffer = useCallback(() => {
    setMakeOffer(true);
  }, [setMakeOffer]);

  const onCloseOffer = useCallback(() => {
    reset();
    setMakeOffer(false);
  }, [setMakeOffer, reset]);

  return {
    registerOffer,
    offerFormState,
    makeOffer,
    onCloseOffer,
    onOpenOffer,

    onUpdateOffer,
    onMakeOffer,
    onCancelOffer,
    handleSubmitOffer,
  };
}
