import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import useLogin from './login';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Marketplace, Nft } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import {
  createCreateOfferInstruction,
  CreateOfferInstructionAccounts,
  CreateOfferInstructionArgs,
} from '@holaplex/mpl-reward-center';
import { PublicKey, Transaction } from '@solana/web3.js';
import { findAuctioneer, findOfferAddress, findRewardCenter } from '../modules/reward-center/pdas';
import { toLamports } from '../modules/sol';

interface OfferForm {
  amount: string;
}

interface MakeOfferForm extends OfferForm {
  nft: Nft;
  marketplace: Marketplace;
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
  onMakeOffer: ({ amount, nft, marketplace }: MakeOfferForm) => void;
  onOpenOffer: () => void;
  onCloseOffer: () => void;
  onCancelOffer: () => void;
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
    getValues,
    formState: offerFormState,
  } = useForm<OfferForm>({
    resolver: zodResolver(schema),
  });

  const onMakeOffer = async ({ amount, nft, marketplace }: MakeOfferForm) => {
    console.log(amount);
    if (connected && publicKey && signTransaction) {
      const ah = marketplace.auctionHouses[0];
      const auctionHouse = new PublicKey(ah.address);
      const offerPrice = toLamports(Number(amount));
      const authority = new PublicKey(ah.authority);
      const ahFeeAcc = new PublicKey(ah.auctionHouseFeeAccount);
      const treasuryMint = new PublicKey(ah.treasuryMint);
      const tokenMint = new PublicKey(nft.mintAddress);
      const metadata = new PublicKey(nft.address);
      const associatedTokenAcc = new PublicKey(nft.owner!.associatedTokenAccountAddress);

      const [programAsSigner, programAsSignerBump] =
        await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

      const [escrowPaymentAcc, escrowPaymentBump] =
        await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouse, publicKey);

      const [sellerTradeState, tradeStateBump] = await AuctionHouseProgram.findTradeStateAddress(
        publicKey,
        auctionHouse,
        associatedTokenAcc,
        treasuryMint,
        tokenMint,
        0,
        1
      );

      const [buyerTradeState, buyerTradeStateBump] =
        await AuctionHouseProgram.findPublicBidTradeStateAddress(
          publicKey,
          auctionHouse,
          treasuryMint,
          tokenMint,
          offerPrice,
          1
        );

      const [rewardCenter] = await findRewardCenter(auctionHouse);

      const [offer] = await findOfferAddress(publicKey, metadata, rewardCenter);

      const [auctioneer] = await findAuctioneer(auctionHouse, rewardCenter);

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
        auctionHouse,
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
        console.log('Error whilst making offer', err);
      } finally {
        setMakeOffer(true);
      }
    } else {
      return login();
    }
  };

  const onCancelOffer = () => {
    // TODO: cancel offer
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
    onMakeOffer,
    onCancelOffer,
    handleSubmitOffer,
  };
}
