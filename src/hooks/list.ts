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
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { AhListing, AuctionHouse, Nft, Maybe } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { toast } from 'react-toastify';
import { RewardCenterProgram } from '../modules/reward-center';
import { toLamports } from '../modules/sol';
import { useApolloClient } from '@apollo/client';
import client from '../client';
import Bugsnag from '@bugsnag/js';
import { notifyInstructionError } from '../modules/bugsnag';
import { rejects } from 'assert';
import { reduceSettledPromise } from '../utils/promises';

interface ListNftForm {
  amount: string;
}

interface ListingDetailsForm extends ListNftForm {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

interface BulkListingForm {
  amounts: { [address: string]: string }
  nfts: Nft[]
  auctionHouse: AuctionHouse;
}

interface BulkListPending {
  nft: Nft
  instructionData: {
    listingAddress: PublicKey;
    sellerTradeState: PublicKey;
    tradeStateBump: number;
    buyerPrice: number;
  };
}

interface ListNftContext {
  listNft: boolean;
  listNftState: FormState<ListNftForm>;
  registerListNft: UseFormRegister<ListNftForm>;
  onListNftClick: () => void;
  onCancelListNftClick: () => void;
  handleSubmitListNft: UseFormHandleSubmit<ListNftForm>;
  onSubmitListNft: (form: ListingDetailsForm) => Promise<void>;
  onSubmitBulkListNft: (form: BulkListingForm) => Promise<{fulfilled: Nft[]}>;
}

export function useListNft(): ListNftContext {
  const { connected, publicKey, signTransaction, signAllTransactions } = useWallet();
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
    if (!connected || !publicKey || !signTransaction || !nft || !nft.owner) {
      return;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = toLamports(Number(amount));
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);
    const token = new PublicKey(auctionHouse?.rewardCenter?.tokenMint);
    const associatedTokenAccount = new PublicKey(nft.owner.associatedTokenAccountAddress);

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

    const tx = new Transaction();

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
          const listing = {
            __typename: 'AhListing',
            id: `temp-id-listing-${listingAddress.toBase58()}`,
            seller: publicKey.toBase58(),
            marketplaceProgramAddress: RewardCenterProgram.PUBKEY.toBase58(),
            tradeState: sellerTradeState.toBase58(),
            tradeStateBump: tradeStateBump,
            price: buyerPrice.toString(),
            auctionHouse: {
              address: auctionHouse.address,
              __typename: 'AuctionHouse',
            },
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
      
      toast('Listing posted', { type: 'success' });
      
    } catch (err: any) {
      notifyInstructionError(err, {
        operation: 'Listing created',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: err.logs,
          nft,
        },
      });
      toast(err.message, { type: 'error' });

    } finally {
      setListNft(false);
    }
      
  };

  const onSubmitBulkListNft = async ({ amounts, nfts, auctionHouse }: BulkListingForm) => {
    if (!connected || !publicKey || !signTransaction || !nfts) {
      return;
    }
    setListNft(true)
    const LISTINGS_PER_TX = 3; // >3 is too large 
    const TX_INTERVAL = 500; //milliseconds to wait between sending tx batches

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);

    //create instruction list (and listed nfts with associated data for the cache)
    const pendingTxInstructions: TransactionInstruction[] = []
    const pendingNfts = await Promise.allSettled(nfts.map(async (nft): Promise<BulkListPending> => {
      if (!nft.owner) throw new Error(`${nft.address} has no owner data available`)
      if (!amounts[nft.address]) throw new Error(`${nft.address} has no listing price`)

      const buyerPrice = toLamports(Number(amounts[nft.address]));
      const tokenMint = new PublicKey(nft.mintAddress);
      const metadata = new PublicKey(nft.address);
      const token = new PublicKey(auctionHouse?.rewardCenter?.tokenMint);
      const associatedTokenAccount = new PublicKey(nft.owner.associatedTokenAccountAddress);
      const [sellerTradeState, tradeStateBump] = await RewardCenterProgram.findAuctioneerTradeStateAddress(
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

      if (!sellerAtAInfo) {
        //We should probably only do this once? but not sure where else to put it since it requires individual token information
        pendingTxInstructions.push(sellerATAInstruction);
      }

      pendingTxInstructions.push(instruction);

      return {
        nft,
        instructionData: {
          listingAddress,
          sellerTradeState,
          tradeStateBump,
          buyerPrice,
        }
      }
    }))

    //nfts (+ data) with successfully made instructions go into .fulfilled, failed to .rejected;
    //"pendingTxInstructions" should only contain the successfully created instructions
    const settledNftInstructions = reduceSettledPromise(pendingNfts)
    console.log("🚀 ~ file: list.ts:380 ~ onSubmitBulkListNft ~ settledNftInstructions", settledNftInstructions)

    //Batch up the listing instructions into transactions
    const pendingTransactions: Transaction[] = [];
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
    const numTransactions = Math.ceil(pendingTxInstructions.length / LISTINGS_PER_TX);
    for (let i = 0; i < numTransactions; i++) {
      let bulkTransaction = new Transaction();
      let lowerIndex = i * LISTINGS_PER_TX;
      let upperIndex = (i + 1) * LISTINGS_PER_TX;
      for (let j = lowerIndex; j < upperIndex; j++) {
        if (pendingTxInstructions[j]) {
          bulkTransaction.add(pendingTxInstructions[j]);
        }
        bulkTransaction.recentBlockhash = blockhash;
        bulkTransaction.feePayer = publicKey;
        pendingTransactions.push(bulkTransaction);
      }
    }

    
    
      //sign all txs
      let signedTxs: Transaction[] = []
      if (signAllTransactions) {
        signedTxs = await signAllTransactions(pendingTransactions);
      } else {
        //fallback to sign tx batches individually (if wallet doesn't support signAll)
        const settledTxs = await Promise.allSettled(pendingTransactions.map(async (tx) => {
          const signedTx = await signTransaction(tx);
          return signedTx
        }))
        const { fulfilled } = reduceSettledPromise(settledTxs)

        signedTxs = fulfilled
      }

      const pendingSigned = await Promise.allSettled(signedTxs.map((tx, i, allTx) => {
        //send all tx in intervals to avoid overloading the network
        return new Promise<string>((resolve => {
          setTimeout(() => {
            console.log(`Requesting Transaction ${i + 1}/${allTx.length}`);
            connection.sendRawTransaction(tx.serialize()).then(txHash => resolve(txHash));
          }, i * TX_INTERVAL)
        }))
      }))
    
      //.fullfiled is tx Hashes / signatures -> use these if you want to confirm the txs before updating the cache
      const settledSignedTxs = reduceSettledPromise(pendingSigned)


      settledNftInstructions.fulfilled.map(({nft, instructionData}) => {
        const { listingAddress, sellerTradeState, tradeStateBump, buyerPrice } = instructionData;
        try {
          client.cache.updateQuery(
            {
              query: NftMarketInfoQuery,
              broadcast: false,
              overwrite: true,
              variables: {
                address: nft.mintAddress,
              },
            },
            (data: any) => {
              const listing = {
                __typename: 'AhListing',
                id: `temp-id-listing-${listingAddress.toBase58()}`,
                seller: publicKey.toBase58(),
                marketplaceProgramAddress: RewardCenterProgram.PUBKEY.toBase58(),
                tradeState: sellerTradeState.toBase58(),
                tradeStateBump: tradeStateBump,
                price: buyerPrice.toString(),
                auctionHouse: {
                  address: auctionHouse.address,
                  __typename: 'AuctionHouse',
                },
              };

              const listings = [...(data.nft?.listings || []), listing];

              return {
                nft: {
                  ...data.nft,
                  listings,
                },
              };
            }
          );
        } catch (e) {
          console.error(e)
        }
 
      })
      
    if (settledSignedTxs.fulfilled.length > 0) {
      const fulfilledNfts = settledNftInstructions.fulfilled.map(({ nft }) => nft)
      toast(`Listings posted: ${fulfilledNfts.map(nft => nft.name).join(", ")}`, { type: 'success' });
      return { fulfilled: fulfilledNfts }
    } else {
      toast("No Items were listed", { type: 'error' });
      return { fulfilled: [] }
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
    onSubmitBulkListNft
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
    if (!connected || !publicKey || !signTransaction || !nft || !nft.owner) {
      return;
    }
    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const buyerPrice = toLamports(Number(amount));
    const metadata = new PublicKey(nft.address);

    const associatedTokenAccount = new PublicKey(nft.owner.associatedTokenAccountAddress);

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

      client.cache.modify({
        id: client.cache.identify({
          __typename: 'AhListing',
          id: listing?.id,
        }),
        fields: {
          price() {
            return buyerPrice.toString();
          },
        },
      });

      toast('Listing price updated', { type: 'success' });
    } catch (err: any) {
      notifyInstructionError(err, {
        operation: 'Listing updated',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: err.logs,
          nft,
        },
      });
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
  auctionHouse: Maybe<AuctionHouse> | undefined;
}

interface CancelListingContext {
  onCloseListing: () => Promise<void>;
  closingListing: boolean;
}

export function useCloseListing({
  listing,
  nft,
  auctionHouse,
}: CloseListingArgs): CancelListingContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [closingListing, setClosing] = useState(false);

  const onCloseListing = async () => {
    if (!publicKey || !signTransaction || !listing || !auctionHouse || !nft || !nft.owner) {
      return;
    }
    setClosing(true);

    const auctionHouseAddress = new PublicKey(auctionHouse.address);
    const authority = new PublicKey(auctionHouse.authority);
    const auctionHouseFeeAccount = new PublicKey(auctionHouse.auctionHouseFeeAccount);
    const treasuryMint = new PublicKey(auctionHouse.treasuryMint);
    const tokenMint = new PublicKey(nft.mintAddress);
    const metadata = new PublicKey(nft.address);

    const associatedTokenAccount = new PublicKey(nft.owner.associatedTokenAccountAddress);

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
          const listings = data.nft.listings.filter((l: AhListing) => l.id !== listing.id);

          return {
            nft: {
              ...data.nft,
              listings,
            },
          };
        }
      );

      toast('Listing canceled', { type: 'success' });
    } catch (err: any) {
      notifyInstructionError(err, {
        operation: 'Listing cancelled',
        metadata: {
          userPubkey: publicKey.toBase58(),
          programLogs: err.logs,
          nft,
        },
      });
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
