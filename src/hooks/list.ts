import { useCallback, useState } from 'react';
import {
  useForm,
  UseFormRegister,
  UseFormHandleSubmit,
  FormState,
  UseFormSetValue,
} from 'react-hook-form';
import useLogin from './login';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  createCreateListingInstruction,
  CreateListingInstructionAccounts,
  CreateListingInstructionArgs,
} from '@holaplex/mpl-reward-center';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Marketplace, Nft } from '../graphql.types';
import { AuctionHouseProgram } from '@holaplex/mpl-auction-house';
import {
  findAuctioneer,
  findListingAddress,
  findRewardCenter,
} from '../modules/reward-center/pdas';
import BN from 'bn.js';

interface ListNftForm {
  amount: number;
  nft: Nft;
  marketplace: Marketplace;
}

interface ListNftContext {
  listNft: boolean;
  registerListNft: UseFormRegister<ListNftForm>;
  handleSubmitListNft: UseFormHandleSubmit<ListNftForm>;
  onSubmit: (form: ListNftForm) => Promise<void>;
  onListNft: () => void;
  onCancelListNft: () => void;
  listNftState: FormState<ListNftForm>;
  setListNftFormValue: UseFormSetValue<ListNftForm>;
}

export default function useListNft(): ListNftContext {
  const { connected, publicKey } = useWallet();
  const login = useLogin();
  const { connection } = useConnection();

  const [listNft, setListNft] = useState(false);
  const {
    register: registerListNft,
    handleSubmit: handleSubmitListNft,
    reset,
    formState: listNftState,
    setValue: setListNftFormValue,
  } = useForm<ListNftForm>();

  const onSubmit = async ({ amount, nft, marketplace }: ListNftForm) => {
    if (connected && publicKey) {
      const ah = marketplace.auctionHouses[0];
      const auctionHouse = new PublicKey(ah.address);
      const buyerPrice = amount;
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
        new BN('18446744073709551615'),
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

      const [rewardCenter] = await findRewardCenter(auctionHouse);

      const [listingAddress] = await findListingAddress(publicKey, metadata, rewardCenter);

      const [auctioneer] = await findAuctioneer(auctionHouse, rewardCenter);

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
      const recentBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = recentBlockhash.blockhash;
      const txtId = await connection.sendRawTransaction(tx.serialize());

      if (txtId) await connection.confirmTransaction(txtId, 'confirmed');
    }
  };

  const onListNft = useCallback(() => {
    if (connected) {
      return setListNft(true);
    }

    return login();
  }, [setListNft, connected, login]);

  const onCancelListNft = useCallback(() => {
    reset();
    setListNft(false);
  }, [setListNft, reset]);

  return {
    registerListNft,
    listNftState,
    listNft,
    onListNft,
    onCancelListNft,
    handleSubmitListNft,
    onSubmit,
    setListNftFormValue,
  };
}
