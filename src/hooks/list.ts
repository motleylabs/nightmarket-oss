import { useCallback, useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';
import useLogin from './login';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  createCreateListingInstruction,
  CreateListingInstructionAccounts,
  CreateListingInstructionArgs,
} from '@holaplex/hpl-reward-center';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Marketplace, Nft } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';

import BN from 'bn.js';
import { RewardCenterProgram } from '../modules/reward-center/RewardCenterProgram';
import { toLamports } from '../modules/sol';

interface ListNftForm {
  amount: string;
}

interface ListingDetailsForm extends ListNftForm {
  nft: Nft;
  marketplace: Marketplace;
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

interface ListNftDefaultValues {
  nft: Nft;
  marketplace: Marketplace;
}

export default function useListNft(): ListNftContext {
  const { connected, publicKey, signTransaction } = useWallet();
  const login = useLogin();
  const { connection } = useConnection();

  const [listNft, setListNft] = useState(false);
  const {
    register: registerListNft,
    handleSubmit: handleSubmitListNft,
    reset,
    formState: listNftState,
  } = useForm<ListNftForm>();

  const onSubmitListNft = async ({ amount, nft, marketplace }: ListingDetailsForm) => {
    if (connected && publicKey && signTransaction) {
      const ah = marketplace.auctionHouses[0];
      const auctionHouse = new PublicKey(ah.address);
      const buyerPrice = toLamports(Number(amount));
      const authority = new PublicKey(ah.authority);
      const auctionHouseFeeAccount = new PublicKey(ah.auctionHouseFeeAccount);
      const treasuryMint = new PublicKey(ah.treasuryMint);
      const tokenMint = new PublicKey(nft.mintAddress);
      const metadata = new PublicKey(nft.address);

      const associatedTokenAccount = new PublicKey(nft.owner!.associatedTokenAccountAddress);

      const [sellerTradeState, tradeStateBump] = await AuctionHouseProgram.findTradeStateAddress(
        publicKey,
        auctionHouse,
        associatedTokenAccount,
        treasuryMint,
        tokenMint,
        buyerPrice,
        1
      );

      const [programAsSigner, programAsSignerBump] =
        await AuctionHouseProgram.findAuctionHouseProgramAsSignerAddress();

      const [freeTradeState, freeTradeBump] = await AuctionHouseProgram.findTradeStateAddress(
        publicKey,
        auctionHouse,
        associatedTokenAccount,
        treasuryMint,
        tokenMint,
        0,
        1
      );

      const [rewardCenter] = await RewardCenterProgram.findRewardCenter(auctionHouse);

      const [listingAddress] = await RewardCenterProgram.findListingAddress(
        publicKey,
        metadata,
        rewardCenter
      );

      const [auctioneer] = await RewardCenterProgram.findAuctioneer(auctionHouse, rewardCenter);

      const accounts: CreateListingInstructionAccounts = {
        auctionHouseProgram: programAsSigner,
        listing: listingAddress,
        rewardCenter: rewardCenter,
        wallet: publicKey,
        tokenAccount: associatedTokenAccount,
        metadata: metadata,
        authority: authority,
        auctionHouse: auctionHouse,
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
          tradeStateBump: tradeStateBump,
          freeTradeStateBump: freeTradeBump,
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
          console.log(`confirmed`);
        }
      } catch (err) {
        console.log('Error whilst listing nft', err);
      } finally {
        setListNft(true);
      }
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
