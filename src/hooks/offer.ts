import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import { useEffect } from 'react';
import useLogin from './login';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AuctionHouse, Maybe, Nft, Offer } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import { NftMarketInfoQuery, NftDetailsQuery } from './../queries/nft.graphql';
import {
  createCreateOfferInstruction,
  CreateOfferInstructionAccounts,
  CreateOfferInstructionArgs,
  createCloseOfferInstruction,
  CloseOfferInstructionAccounts,
  CloseOfferInstructionArgs,
  createAcceptOfferInstruction,
  AcceptOfferInstructionAccounts,
  AcceptOfferInstructionArgs,
} from '@holaplex/hpl-reward-center';
import {
  PublicKey,
  Transaction,
  AccountMeta,
  TransactionInstruction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { toLamports } from '../modules/sol';
import { RewardCenterProgram } from '../modules/reward-center';
import { toast } from 'react-toastify';
import { useApolloClient } from '@apollo/client';
import client from '../client';
import { useRouter } from 'next/router';
import Bugsnag from '@bugsnag/js';
import { notifyInstructionError } from '../modules/bugsnag';

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

interface MakeOfferResponse {
  buyerTradeState: PublicKey;
  metadata: PublicKey;
  buyerTradeStateBump: number;
  associatedTokenAccount: PublicKey;
  buyerPrice: number;
}

interface MakeOfferContext {
  makeOffer: boolean;
  registerOffer: UseFormRegister<OfferForm>;
  handleSubmitOffer: UseFormHandleSubmit<OfferForm>;
  onMakeOffer: ({
    amount,
    nft,
    auctionHouse,
  }: MakeOfferForm) => Promise<MakeOfferResponse | undefined>;
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
    formState: offerFormState,
  } = useForm<OfferForm>({
    resolver: zodResolver(schema),
  });

  const onMakeOffer = async ({ amount, nft, auctionHouse }: MakeOfferForm) => {
    if (!connected || !publicKey || !signTransaction || !nft || !nft.owner) {
      throw Error('not all params provided');
    }

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = toLamports(Number(amount));
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const associatedTokenAccount = new PublicKey(nft.owner.associatedTokenAccountAddress);
    const token = new PublicKey(auctionHouse?.rewardCenter?.tokenMint);

    const ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      publicKey
    );

    console.log('make offer', {
      associatedTokenAccount: associatedTokenAccount.toBase58(),
      ata: ata.toBase58(),
    });

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [buyerTradeState, buyerTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        buyerPrice,
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
      tokenAccount: associatedTokenAccount,
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
        buyerPrice,
        tokenSize: 1,
      },
    };

    const instruction = createCreateOfferInstruction(accounts, args);
    const tx = new Transaction();

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

    const buyerAtAInfo = await connection.getAccountInfo(buyerRewardTokenAccount);

    if (!buyerAtAInfo) {
      tx.add(buyerATAInstruction);
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
      }

      toast('Your offer is in', { type: 'success' });

      return { buyerTradeState, metadata, buyerTradeStateBump, associatedTokenAccount, buyerPrice };
    } catch (err: any) {
      notifyInstructionError(err, {
        errorName: 'Offer created',
        userPubkey: publicKey.toBase58(),
        metadata: {
          programLogs: err.logs,
          nft,
        },
      });

      toast(err.message, { type: 'error' });

      throw err;
    } finally {
      setMakeOffer(false);
    }
  };

  const onOpenOffer = useCallback(() => {
    if (connected) {
      setMakeOffer(true);
      return;
    }
    login();
  }, [setMakeOffer, login, connected]);

  const onCancelMakeOffer = useCallback(() => {
    setMakeOffer(false);
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
  const client = useApolloClient();
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
    if (!connected || !publicKey || !signTransaction || !offer || !nft || !nft.owner) {
      return;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const newOfferPrice = toLamports(Number(amount));
    const authority = new PublicKey(auctionHouse.authority);
    const ahFeeAcc = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const associatedTokenAcc = new PublicKey(nft.owner.associatedTokenAccountAddress);

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

    const [buyerTradeState, buyerTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        offer.price.toNumber(),
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

    const closeOfferAccounts: CloseOfferInstructionAccounts = {
      wallet: publicKey,
      offer: rewardsOffer,
      treasuryMint,
      tokenAccount: associatedTokenAcc,
      receiptAccount: publicKey,
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
      }

      client.cache.modify({
        id: client.cache.identify({
          __typename: 'Offer',
          id: offer.id,
        }),
        fields: {
          price() {
            return newOfferPrice.toString();
          },
        },
      });

      toast('Offer updated', { type: 'success' });
    } catch (err: any) {
      notifyInstructionError(err, {
        errorName: 'Offer updated',
        userPubkey: publicKey.toBase58(),
        metadata: {
          programLogs: err.logs,
          nft,
        },
      });

      toast(err.message, { type: 'error' });
    } finally {
      setUpdateOffer(false);
    }
  };

  const onOpenUpdateOffer = useCallback(() => {
    if (connected) {
      setUpdateOffer(true);
      return;
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
  const router = useRouter();
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

    const [buyerTradeState, _tradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        offer.price.toNumber(),
        1
      );

    const [escrowPaymentAcc, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, publicKey);

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
      receiptAccount: publicKey,
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

      client.cache.updateQuery(
        {
          query: NftMarketInfoQuery,
          broadcast: false,
          overwrite: true,
          variables: {
            address: nft.mintAddress,
          },
        },
        (data) => {
          const offers = data.nft.offers.filter((o: Offer) => o.id !== offer.id);

          return {
            nft: {
              ...data.nft,
              offers,
            },
          };
        }
      );

      toast('Offer canceled', { type: 'success' });
    } catch (err: any) {
      notifyInstructionError(err, {
        errorName: 'Offer canceled',
        userPubkey: publicKey.toBase58(),
        metadata: {
          programLogs: err.logs,
          nft,
        },
      });

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

interface AcceptOfferParams {
  auctionHouse: AuctionHouse;
  nft: Nft;
}

interface AcceptOfferResponse {
  buyerTradeState: PublicKey;
  metadata: PublicKey;
}

interface AcceptOfferContext {
  acceptingOffer: boolean;
  onAcceptOffer: (args: AcceptOfferParams) => Promise<AcceptOfferResponse | undefined>;
}

export function useAcceptOffer(offer: Maybe<Offer> | undefined): AcceptOfferContext {
  const [acceptingOffer, setAcceptingOffer] = useState(false);
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const onAcceptOffer = async ({ auctionHouse, nft }: AcceptOfferParams) => {
    if (!connected || !publicKey || !signTransaction || !offer) {
      throw Error('not all params provided');
    }

    setAcceptingOffer(true);

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = parseInt(offer.price);
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const auctionHouseTreasury = new PublicKey(auctionHouse.auctionHouseTreasury);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const buyerAddress = new PublicKey(offer.buyer);
    const token = new PublicKey(auctionHouse.rewardCenter?.tokenMint);
    const associatedTokenAccount = new PublicKey(nft.owner!.associatedTokenAccountAddress);

    const [buyerTradeState, buyerTradeStateBump] =
      await AuctionHouseProgram.findPublicBidTradeStateAddress(
        buyerAddress,
        auctionHouseAddress,
        treasuryMint,
        tokenMint,
        buyerPrice,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [escrowPaymentAccount, escrowPaymentBump] =
      await AuctionHouseProgram.findEscrowPaymentAccountAddress(auctionHouseAddress, buyerAddress);

    const rewardCenterRewardTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      rewardCenter,
      true
    );

    const [buyerReceiptTokenAccount] = await AuctionHouseProgram.findAssociatedTokenAccountAddress(
      tokenMint,
      buyerAddress
    );

    const [sellerTradeState, sellerTradeStateBump] =
      await RewardCenterProgram.findAuctioneerTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        associatedTokenAccount,
        treasuryMint,
        tokenMint,
        1
      );

    const [programAsSigner, programAsSignerBump] =
      await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

    const [freeSellerTradeState, freeTradeStateBump] =
      await AuctionHouseProgram.findTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        associatedTokenAccount,
        treasuryMint,
        tokenMint,
        0,
        1
      );

    const [rewardsOffer] = await RewardCenterProgram.findOfferAddress(
      buyerAddress,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const buyerRewardTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      buyerAddress
    );

    const sellerRewardTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      publicKey
    );

    const sellerATAInstruction = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      token,
      sellerRewardTokenAccount,
      publicKey,
      publicKey
    );

    const sellerAtAInfo = await connection.getAccountInfo(sellerRewardTokenAccount);

    const acceptOfferAccounts: AcceptOfferInstructionAccounts = {
      buyer: buyerAddress,
      buyerRewardTokenAccount,
      seller: publicKey,
      sellerRewardTokenAccount,
      offer: rewardsOffer,
      tokenAccount: associatedTokenAccount,
      tokenMint,
      metadata,
      treasuryMint,
      sellerPaymentReceiptAccount: publicKey,
      buyerReceiptTokenAccount,
      authority,
      escrowPaymentAccount,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount,
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

    const acceptOfferArgs: AcceptOfferInstructionArgs = {
      acceptOfferParams: {
        escrowPaymentBump,
        freeTradeStateBump,
        sellerTradeStateBump,
        programAsSignerBump,
        buyerTradeStateBump,
      },
    };

    const acceptOfferIx = createAcceptOfferInstruction(acceptOfferAccounts, acceptOfferArgs);

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

    const keys = acceptOfferIx.keys.concat(remainingAccounts);

    const ix = ComputeBudgetProgram.setComputeUnitLimit({ units: 350000 });

    tx.add(ix);

    if (!sellerAtAInfo) {
      tx.add(sellerATAInstruction);
    }

    tx.add(
      new TransactionInstruction({
        programId: RewardCenterProgram.PUBKEY,
        data: acceptOfferIx.data,
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

      if (router.pathname === '/nfts/[address]/details') {
        client.cache.updateQuery(
          {
            query: NftDetailsQuery,
            broadcast: false,
            overwrite: true,
            variables: {
              address: nft.mintAddress,
            },
          },
          (data) => {
            return {
              nft: {
                ...data.nft,
                owner: {
                  __typename: 'NftOwner',
                  address: buyerAddress.toBase58(),
                  associatedTokenAccountAddress: buyerReceiptTokenAccount.toBase58(),
                  profile: null,
                },
              },
            };
          }
        );
      }

      client.cache.updateQuery(
        {
          query: NftMarketInfoQuery,
          broadcast: false,
          overwrite: true,
          variables: {
            address: nft.mintAddress,
          },
        },
        (data) => {
          const offers = data.nft.offers.filter((o: Offer) => o.id !== offer.id);

          const nft = {
            ...data.nft,
            offers,
            lastSale: {
              __typename: 'LastSale',
              price: buyerPrice.toString(),
            },
            owner: {
              __typename: 'NftOwner',
              address: buyerAddress.toBase58(),
              associatedTokenAccountAddress: buyerReceiptTokenAccount.toBase58(),
              profile: null,
            },
          };

          return {
            nft,
          };
        }
      );

      toast('Offer accepted', { type: 'success' });

      return { buyerTradeState, metadata };
    } catch (err: any) {
      notifyInstructionError(err, {
        errorName: 'Offer accepted',
        userPubkey: publicKey.toBase58(),
        metadata: {
          programLogs: err.logs,
          nft,
        },
      });

      toast(err.message, { type: 'error' });

      throw err;
    } finally {
      setAcceptingOffer(false);
    }
  };

  return {
    acceptingOffer,
    onAcceptOffer,
  };
}
