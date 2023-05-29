import type React from 'react';
import { useState, useCallback } from 'react';
import useSWR from 'swr';

import type { GlobalSearchData, Nft } from '../typings';
import type { StatSearchData } from '../typings';
import { debounce } from '../utils/debounce';
import { useTrendingSearch } from './collection/useTrendingSearch';

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
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
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

  const { data: trendingCollections, isValidating: isValidatingTrendingCollections } =
    useTrendingSearch(searchTerm);

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
    (!searchTerm && !trendingCollections && isValidatingTrendingCollections) ||
    (!!searchTerm && !collections && isValidatingCollections) ||
    (!profiles && isValidatingProfiles) ||
    (!nft && isValidatingNft);

  return {
    searchTerm,
    setSearchTerm,
    hasResults:
      !isLoading &&
      ((!!searchTerm && !!collections?.results?.length) ||
        (!searchTerm && !!trendingCollections?.trends.length) ||
        !!profiles?.results?.length ||
        !!nft),
    searching: isLoading,
    results: {
      nft: nft ? { searchType: SearchMode.Nft, ...nft } : undefined,
      profiles: profiles
        ? profiles.results.map((p) => ({ ...p, searchType: SearchMode.Profile }))
        : [],
      collections: !searchTerm
        ? trendingCollections
          ? trendingCollections.trends.map((c) => ({
              imgURL: c.collection.image,
              isVerified: c.collection.isVerified,
              name: c.collection.name,
              slug: c.collection.slug,
              volume1d: c.volume1d,
              address: '',
              twitter: '',
              searchType: SearchMode.Collection,
            }))
          : []
        : collections
        ? collections.results.map((c) => ({ ...c, searchType: SearchMode.Collection }))
        : [],
    },
    updateSearch,
  };
}
