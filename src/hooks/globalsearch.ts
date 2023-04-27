import type React from 'react';
import { useState, useCallback } from 'react';
import useSWR from 'swr';

import type { GlobalSearchData, Nft } from '../typings';
import type { StatSearchData } from '../typings';
import { debounce } from '../utils/debounce';

const TOKEN_LENGTH = 44;

export enum SearchMode {
  Nft = 'nft',
  Profile = 'profile',
  Collection = 'collection',
}

const defaultQueryData = '&limit=10&offset=0';

type OnUpdateSearch = (evt: React.ChangeEvent<HTMLInputElement>) => void;

interface GlobalSearchContext {
  searchTerm: string;
  hasResults: boolean;
  updateSearch: OnUpdateSearch;
  searching: boolean;
  results: GlobalSearchData;
}

export default function useGlobalSearch(): GlobalSearchContext {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedUpdateSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  const updateSearch: OnUpdateSearch = useCallback(
    (evt) => {
      debouncedUpdateSearch(evt.target.value);
    },
    [debouncedUpdateSearch]
  );

  const { data: collections, isValidating: isValidatingCollections } = useSWR<StatSearchData>(
    searchTerm
      ? `/stat/search?keyword=${searchTerm}&mode=${SearchMode.Collection}${defaultQueryData}`
      : null,
    { revalidateOnFocus: false }
  );

  const { data: profiles, isValidating: isValidatingProfiles } = useSWR<StatSearchData>(
    searchTerm
      ? `/stat/search?keyword=${searchTerm}&mode=${SearchMode.Profile}${defaultQueryData}`
      : null,
    { revalidateOnFocus: false }
  );

  const { data: nft, isValidating: isValidatingNft } = useSWR<Nft>(
    searchTerm && searchTerm.length === TOKEN_LENGTH ? `/nfts/${searchTerm}` : null,
    { revalidateOnFocus: false }
  );

  const isLoading =
    (!collections && isValidatingCollections) ||
    (!profiles && isValidatingProfiles) ||
    (!nft && isValidatingNft);

  return {
    searchTerm,
    hasResults:
      !isLoading && (!!collections?.results?.length || !!profiles?.results?.length || !!nft),
    searching: isLoading,
    results: {
      nft: nft ? { searchType: SearchMode.Nft, ...nft } : undefined,
      profiles: profiles
        ? profiles.results.map((p) => ({ ...p, searchType: SearchMode.Profile }))
        : [],
      collections: collections
        ? collections.results.map((c) => ({ ...c, searchType: SearchMode.Collection }))
        : [],
    },
    updateSearch,
  };
}
