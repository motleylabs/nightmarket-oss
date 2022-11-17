import { useCallback, useEffect, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import useLogin from './login';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  createCreateListingInstruction,
  CreateListingInstructionAccounts,
  CreateListingInstructionArgs,
  createCloseListingInstruction,
  CloseListingInstructionAccounts,
  createUpdateListingInstruction,
  UpdateListingInstructionAccounts,
  UpdateListingInstructionArgs,
} from '@holaplex/hpl-reward-center';
import { NftMarketInfoQuery } from './../queries/nft.graphql';
import { PublicKey, Transaction } from '@solana/web3.js';
import { AhListing, AuctionHouse, Nft, Maybe } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import { toast } from 'react-toastify';
import { RewardCenterProgram } from '../modules/reward-center';
import { toLamports } from '../modules/sol';
import { useApolloClient } from '@apollo/client';
import config from '../app.config';
import client from '../client';

interface ListNftForm {
  amount: string;
}

interface ListingDetailsForm extends ListNftForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

interface ListNftContext {
  listNft: boolean;
  listNftState: FormState<ListNftForm>;
  registerListNft: UseFormRegister<ListNftForm>;
  onListNftClick: () => void;
  onCancelListNftClick: () => void;
  handleSubmitListNft: UseFormHandleSubmit<ListNftForm>;
  onSubmitListNft: (form: ListingDetailsForm) => Promise<void>;
}

export function useListNft(): ListNftContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const login = useLogin();
  const { connection } = useConnection();
  const client = useApolloClient();

  const [listNft, setListNft] = useState(false);
  const {
    register: registerListNft,
    handleSubmit: handleSubmitListNft,
    reset,
    formState: listNftState,
  } = useForm<ListNftForm>();

  const onSubmitListNft = async ({ amount, nft, auctionHouse }: ListingDetailsForm) => {
    if (!connected || !publicKey || !signTransaction) {
      return;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = toLamports(Number(amount));
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);

    const associatedTokenAccount = new PublicKey(nft.owner!.associatedTokenAccountAddress);

    const [sellerTradeState, tradeStateBump] =
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

    const [freeTradeState, freeTradeStateBump] = await AuctionHouseProgram.findTradeStateAddress(
      publicKey,
      auctionHouseAddress,
      associatedTokenAccount,
      treasuryMint,
      tokenMint,
      0,
      1
    );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [listingAddress] = await RewardCenterProgram.findListingAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CreateListingInstructionAccounts = {
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      listing: listingAddress,
      rewardCenter: rewardCenter,
      wallet: publicKey,
      tokenAccount: associatedTokenAccount,
      metadata: metadata,
      authority: authority,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: auctionHouseFeeAccount,
      sellerTradeState: sellerTradeState,
      freeSellerTradeState: freeTradeState,
      ahAuctioneerPda: auctioneer,
      programAsSigner: programAsSigner,
    };

    const args: CreateListingInstructionArgs = {
      createListingParams: {
        price: buyerPrice,
        tokenSize: 1,
        tradeStateBump,
        freeTradeStateBump,
        programAsSignerBump: programAsSignerBump,
      },
    };

    const instruction = createCreateListingInstruction(accounts, args);

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

        toast('Listing posted', { type: 'success' });
      }

      // TODO: fix ui updating
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
          const listing = {
            __typename: 'AhListing',
            id: `temp-id-listing-${publicKey.toBase58()}`,
            address: listingAddress.toBase58(),
            createdAt: new Date().toISOString(),
            auctionHouse: {
              __typename: 'AuctionHouse',
              address: config.auctionHouse,
              auctionHouseFeeAccount: auctionHouse.auctionHouseFeeAccount,
              treasuryMint: treasuryMint.toBase58(),
              authority: authority.toBase58(),
              rewardCenter: null,
            },
            seller: publicKey.toBase58(),
            marketplaceProgramAddress: config.auctionHouse,
            tradeState: sellerTradeState.toBase58(),
            tradeStateBump: tradeStateBump,
            price: buyerPrice.toString(),
          };

          const listings = [...data.nft.listings, listing];

          return {
            nft: {
              ...data.nft,
              listings,
            },
          };
        }
      );
    } catch (err: any) {
      toast(err.message, { type: 'error' });
    } finally {
      setListNft(false);
    }
  };

  const onListNftClick = useCallback(() => {
    if (connected) {
      return setListNft(true);
    }

    return login();
  }, [setListNft, connected, login]);

  const onCancelListNftClick = useCallback(() => {
    reset();
    setListNft(false);
  }, [setListNft, reset]);

  return {
    listNft,
    listNftState,
    registerListNft,
    onListNftClick,
    onCancelListNftClick,
    handleSubmitListNft,
    onSubmitListNft,
  };
}

interface UpdateListingArgs {
  listing: Maybe<AhListing> | undefined;
}

interface UpdateListingForm {
  amount: string;
}

interface UpdateListingDetailsForm extends UpdateListingForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

interface UpdateListingContext {
  updateListing: boolean;
  updateListingState: FormState<UpdateListingForm>;
  registerUpdateListing: UseFormRegister<UpdateListingForm>;
  onUpdateListing: () => void;
  onCancelUpdateListing: () => void;
  handleSubmitUpdateListing: UseFormHandleSubmit<UpdateListingForm>;
  onSubmitUpdateListing: (form: UpdateListingDetailsForm) => Promise<void>;
}

export function useUpdateListing({ listing }: UpdateListingArgs): UpdateListingContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const login = useLogin();
  const { connection } = useConnection();

  const [updateListing, setUpdateListing] = useState(false);

  const {
    register: registerUpdateListing,
    handleSubmit: handleSubmitUpdateListing,
    reset,
    formState: updateListingState,
  } = useForm<UpdateListingForm>();

  useEffect(() => {
    reset({
      amount: listing?.solPrice?.toString(),
    });
  }, [listing?.solPrice, reset]);

  const onSubmitUpdateListing = async ({ amount, nft, auctionHouse }: ListingDetailsForm) => {
    if (!connected || !publicKey || !signTransaction) {
      return;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = toLamports(Number(amount));
    const metadata = new PublicKey(nft.address);

    const associatedTokenAccount = new PublicKey(nft.owner!.associatedTokenAccountAddress);

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [listingAddress] = await RewardCenterProgram.findListingAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const accounts: UpdateListingInstructionAccounts = {
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      listing: listingAddress,
      rewardCenter: rewardCenter,
      wallet: publicKey,
      tokenAccount: associatedTokenAccount,
      metadata: metadata,
      auctionHouse: auctionHouseAddress,
    };

    const args: UpdateListingInstructionArgs = {
      updateListingParams: {
        newPrice: buyerPrice,
      },
    };

    const instruction = createUpdateListingInstruction(accounts, args);

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

        toast('Listing posted', { type: 'success' });
      }

      // TODO: fix update UI
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
          const listings = [...data.nft.listings].filter(
            (listing: AhListing) => listing.seller !== publicKey.toBase58()
          );
          const listing = {
            __typename: 'AhListing',
            id: `temp-id-listing-${publicKey.toBase58()}`,
            address: listingAddress.toBase58(),
            createdAt: new Date().toISOString(),
            auctionHouse: {
              __typename: 'AuctionHouse',
              address: config.auctionHouse,
              auctionHouseFeeAccount: auctionHouse.auctionHouseFeeAccount,
              treasuryMint: 'temp-treasuryMint',
              authority: 'temp-authority',
              rewardCenter: null,
            },
            seller: publicKey.toBase58(),
            marketplaceProgramAddress: config.auctionHouse,
            tradeState: 'temp-tradeState',
            tradeStateBump: 0,
            price: buyerPrice.toString(),
          };

          return {
            nft: {
              ...data.nft,
              listings: [...listings, listing],
            },
          };
        }
      );
    } catch (err: any) {
      toast(err.message, { type: 'error' });
    } finally {
      setUpdateListing(false);
    }
  };

  const onUpdateListing = useCallback(() => {
    if (connected) {
      return setUpdateListing(true);
    }

    return login();
  }, [setUpdateListing, connected, login]);

  const onCancelUpdateListing = useCallback(() => {
    reset();
    setUpdateListing(false);
  }, [setUpdateListing, reset]);

  return {
    updateListing,
    updateListingState,
    registerUpdateListing,
    onUpdateListing,
    onCancelUpdateListing,
    handleSubmitUpdateListing,
    onSubmitUpdateListing,
  };
}

interface CloseListingArgs {
  listing: Maybe<AhListing> | undefined;
  nft: Nft;
}

interface CancelListingContext {
  onCloseListing: () => Promise<void>;
  closingListing: boolean;
}

export function useCloseListing({ listing, nft }: CloseListingArgs): CancelListingContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [closingListing, setClosing] = useState(false);

  const onCloseListing = async () => {
    if (!publicKey || !signTransaction || !listing || !listing.auctionHouse) {
      return;
    }
    setClosing(true);
    const auctionHouse = listing.auctionHouse;

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);

    const associatedTokenAccount = new PublicKey(nft.owner!.associatedTokenAccountAddress);

    listing.auctionHouse?.treasuryMint;

    const [sellerTradeState, _tradeStateBump] =
      await RewardCenterProgram.findAuctioneerTradeStateAddress(
        publicKey,
        auctionHouseAddress,
        associatedTokenAccount,
        treasuryMint,
        tokenMint,
        1
      );

    const [rewardCenter] = await RewardCenterProgram.findRewardCenterAddress(auctionHouseAddress);

    const [listingAddress] = await RewardCenterProgram.findListingAddress(
      publicKey,
      metadata,
      rewardCenter
    );

    const [auctioneer] = await RewardCenterProgram.findAuctioneerAddress(
      auctionHouseAddress,
      rewardCenter
    );

    const accounts: CloseListingInstructionAccounts = {
      auctionHouseProgram: AuctionHouseProgram.PUBKEY,
      listing: listingAddress,
      rewardCenter: rewardCenter,
      wallet: publicKey,
      tokenAccount: associatedTokenAccount,
      metadata: metadata,
      authority: authority,
      auctionHouse: auctionHouseAddress,
      auctionHouseFeeAccount: auctionHouseFeeAccount,
      tokenMint,
      tradeState: sellerTradeState,
      ahAuctioneerPda: auctioneer,
    };

    const instruction = createCloseListingInstruction(accounts);

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

        toast('Listing canceled', { type: 'success' });
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
          const listings = [...data.nft.listings].filter(
            (listing: AhListing) => listing.seller !== publicKey.toBase58()
          );
          return {
            nft: {
              ...data.nft,
              listings,
            },
          };
        }
      );
    } catch (err: any) {
      toast(err.message, { type: 'error' });
    } finally {
      setClosing(false);
    }
  };

  return {
    onCloseListing,
    closingListing,
  };
}
