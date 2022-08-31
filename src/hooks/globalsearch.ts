import { useLazyQuery, OperationVariables, ApolloQueryResult } from '@apollo/client';
import React, { useMemo, useState } from 'react';
import { isPublicKey } from './../modules/address';
import GlobalSearchQuery from './../queries/search.graphql';
import { Wallet, Nft, MetadataJson } from './../graphql.types';

export interface GlobalSearchData {
  profiles: Wallet[];
  wallet: Wallet;
  nfts: Nft[];
  collections: MetadataJson[];
}

type OnUpdateSearch = (event: React.ChangeEvent<HTMLInputElement>) => void;

interface GlobalSearchContext {
  previousResults: GlobalSearchData | undefined;
  searchTerm: string;
  hasResults: boolean;
  updateSearch: OnUpdateSearch;
  searching: boolean;
  results: GlobalSearchData | undefined;
  refreshSearch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<GlobalSearchData>>;
}

export default function useGlobalSearch(): GlobalSearchContext {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [searchQuery, { data, loading, refetch, previousData }] =
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
    previousResults: previousData,
    updateSearch,
    searching: loading,
    results: data,
    refreshSearch: refetch,
  };
}
