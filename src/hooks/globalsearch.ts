import { useLazyQuery } from '@apollo/client';
import React, { useMemo, useState } from 'react';
import { isPublicKey } from './../modules/address';
import GlobalSearchQuery from './../queries/search.graphql';
import { Wallet, Nft } from './../types';

export interface GlobalSearchData {
  profiles: Wallet[];
  wallet: Wallet;
  nfts: Nft[];
  collections: Nft[];
}

type OnUpdateSearch = (event: React.ChangeEvent<HTMLInputElement>) => void;

export default function useGlobalSearch() {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [searchQuery, { data, loading, called, variables, refetch }] =
    useLazyQuery<GlobalSearchData>(GlobalSearchQuery);

  const hasResults = useMemo(() => {
    if (!data || 'error' in data) {
      return false;
    }
    if (
      data.collections?.length > 0 ||
      data.nfts?.length > 0 ||
      data.profiles?.length > 0 ||
      isPublicKey(data?.wallet?.address)
    ) {
      return true;
    } else {
      return false;
    }
  }, [data]);

  const updateSearch: OnUpdateSearch = (e) => {
    const term = e?.target?.value;

    setSearchTerm(term);
    searchQuery({
      variables: {
        term: term,
        walletAddress: term,
        nftMintAddress: term,
      },
    });
  };

  return {
    searchTerm,
    hasResults,
    updateSearch,
    searching: loading,
    results: data,
    refreshSearch: refetch,
  };
}
