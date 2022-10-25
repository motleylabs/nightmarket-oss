import React, { FC, Fragment, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { DebounceInput } from 'react-debounce-input';
import { MetadataJson, Nft, NftCreator, Wallet, Maybe, Collection } from '../graphql.types';
import { useTranslation } from 'next-i18next';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { GlobalSearchData } from '../hooks/globalsearch';

type Input = FC;
type Group = FC;
type Header = FC;
type Results = FC;
type Loading = FC;
type CollectionItem = FC;
type ProfileItem = FC;
type NftItem = FC;

interface SearchProps {
  children: ReactNode;
  Input?: Input;
  Group?: Group;
  Header?: Header;
  Results?: Results;
  Loading?: Loading;
  Profile?: ProfileItem;
  Collection?: CollectionItem;
  MintAddress?: NftItem;
}

type SearchResultItemType =
  | GlobalSearchData['profiles'][0]
  | GlobalSearchData['collections'][0]
  | GlobalSearchData['nfts'][0]
  | GlobalSearchData['wallet'];

export default function Search({ children }: SearchProps) {
  const [selected, setSelected] = useState<SearchResultItemType | null>(null);

  const router = useRouter();

  return (
    <Combobox
      value={selected}
      onChange={(selection) => {
        setSelected(selection);

        switch (selection?.__typename) {
          case 'CollectionDocument':
            if (!selection.id) {
              // TODO: have a fallback to view these
              console.error('Missing verified collectiona address');
              break;
            }
            router.push(`/collections/${selection.id}`);
            break;
          case 'Nft':
            router.push(`/nfts/${selection.mintAddress}`);
            break;
          case 'Wallet':
            router.push(`/profiles/${selection.address}`);
            break;
          default:
            console.error('Unknown content whilst searching');
            break;
        }
      }}
    >
      {children}
    </Combobox>
  );
}

interface SearchInputProps {
  value: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autofocus?: boolean;
}

function SearchInput({
  onChange,
  onFocus,
  onBlur,
  value,
  autofocus,
  className,
}: SearchInputProps): JSX.Element {
  const { t } = useTranslation('common');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!e.ctrlKey) return;
    switch (e.key) {
      case 'k':
        e.preventDefault();
        e.stopPropagation();
        searchInputRef.current?.focus();
        return;
      default:
        return;
    }
  };

  return (
    <div className={clsx('group relative block w-full transition-all', className)}>
      <button
        onClick={useCallback(() => searchInputRef?.current?.focus(), [searchInputRef])}
        className="absolute left-4 flex h-full cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out hover:scale-105"
      >
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
      </button>
      <DebounceInput
        minLength={2}
        debounceTimeout={300}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="block w-full rounded-full border-2 border-gray-900 bg-transparent py-2 pl-12 pr-6 text-base text-white transition-all hover:border-white focus:border-white focus:placeholder-gray-400 focus:outline-none md:py-2"
        type="search"
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        placeholder={t('search.placeholder')}
        onChange={onChange}
        inputRef={searchInputRef}
        element={Combobox.Input}
        autoFocus={autofocus}
      />
      <button className="absolute right-4 top-0 hidden h-full  items-center justify-center md:flex">
        <span className="hidden h-6 w-6 items-center justify-center rounded bg-gray-800 text-sm text-gray-300 group-focus-within:flex group-hover:flex">
          K
        </span>
      </button>
    </div>
  );
}
Search.Input = SearchInput;

interface SearchResultsProps {
  searching: boolean;
  children: ReactNode;
  error?: any;
  hasResults: boolean;
  enabled?: boolean;
}

function SearchResults({
  searching,
  children,
  hasResults,
  enabled = false,
}: SearchResultsProps): JSX.Element {
  const { t } = useTranslation('common');

  return (
    <Transition
      as={Fragment}
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterLeave={() => {}}
    >
      <Combobox.Options className="scrollbar-thumb-rounded-full absolute top-4 z-50  h-[calc(100vh-45px)] w-full gap-6 overflow-y-scroll rounded-md bg-gray-900 p-4 shadow-lg shadow-black transition ease-in-out scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800 md:top-10 md:max-h-96">
        {searching ? (
          <>
            <SearchLoadingItem />
            <SearchLoadingItem variant="circle" />
            <SearchLoadingItem />
            <SearchLoadingItem variant="circle" />
          </>
        ) : hasResults ? (
          children
        ) : (
          <>
            {enabled ? (
              <div className="flex h-6 w-full items-center justify-center">
                <p className="m-0 text-center text-base font-medium">{t('search.empty')}</p>
              </div>
            ) : (
              <>
                <SearchLoadingItem />
                <SearchLoadingItem variant="circle" />
                <SearchLoadingItem />
                <SearchLoadingItem variant="circle" />
              </>
            )}
          </>
        )}
      </Combobox.Options>
    </Transition>
  );
}
Search.Results = SearchResults;

interface SearchGroupProps<T> {
  title: string;
  children: (data: { result: T | undefined }) => ReactNode;
  result: T | undefined;
}

function SearchGroup<T>({ title, children, result }: SearchGroupProps<T>): JSX.Element | null {
  if ((result instanceof Array && result.length === 0) || result === null) {
    return null;
  }

  return (
    <>
      <h6 className="mb-2 border-b border-gray-700 pt-4 pb-2 text-base font-medium text-gray-300">
        {title}
      </h6>
      {children({ result })}
    </>
  );
}
Search.Group = SearchGroup;

interface SearchResultProps {
  address: string;
  image: string;
  name?: Maybe<string> | undefined;
  value: SearchResultItemType | MetadataJson;
}

interface CollectionSearchResultProps extends SearchResultProps {
  collection?: Collection;
}

function CollectionSearchResult({
  name,
  image,
  collection,
  value,
}: CollectionSearchResultProps): JSX.Element {
  const router = useRouter();

  return (
    <Combobox.Option
      key={`collection-${collection?.id}`}
      value={value}
      onClick={useCallback(() => {
        router.push(`/collections/${collection?.id}/nfts`);
      }, [router, collection?.id])}
    >
      {({ active }) => (
        <div
          className={clsx(
            'flex cursor-pointer flex-row items-center justify-between rounded-md p-4 hover:bg-gray-700',
            { 'bg-gray-700': active }
          )}
        >
          <div className="flex flex-row items-center gap-6">
            <img
              src={image}
              alt={name || collection?.id}
              className="aspect-square h-10 w-10 overflow-hidden rounded-md text-sm"
            />
            <p className="m-0 text-sm font-bold">{name}</p>
          </div>
        </div>
      )}
    </Combobox.Option>
  );
}

Search.Collection = CollectionSearchResult;

interface MintAddressSearchResultProps extends SearchResultProps {
  creator?: NftCreator;
  nft?: Nft;
}

function MintAddressSearchResult({
  creator,
  address,
  name,
  image,
  nft,
  value,
}: MintAddressSearchResultProps): JSX.Element {
  const router = useRouter();

  return (
    <Combobox.Option
      key={`nft-${address}`}
      value={value}
      onClick={useCallback(() => {
        router.push(`/nfts/${address}`);
      }, [router, address])}
    >
      {({ active }) => (
        <div
          className={clsx(
            'flex cursor-pointer flex-row items-center justify-between rounded-md p-4 hover:bg-gray-700 ',
            { 'bg-gray-700': active }
          )}
        >
          <div className="flex flex-row items-center gap-6">
            <img
              src={image}
              alt={name || address}
              className="aspect-square h-10 w-10 overflow-hidden rounded-md text-sm"
            />
            <p className="m-0 text-sm font-bold">{name}</p>
          </div>
          {creator && (
            <div className="flex items-center justify-end gap-4">
              <p className="m-0 hidden items-center gap-2 text-sm text-gray-300 md:flex">
                {creator.displayName}
              </p>
            </div>
          )}
        </div>
      )}
    </Combobox.Option>
  );
}

Search.MintAddress = MintAddressSearchResult;

interface ProfileSearchResultProps extends SearchResultProps {
  profile?: Wallet;
}

function ProfileSearchResult({
  image,
  address,
  profile,
  value,
}: ProfileSearchResultProps): JSX.Element | null {
  const router = useRouter();

  return (
    <Combobox.Option
      key={`profile-${address}`}
      value={value}
      onClick={useCallback(() => {
        router.push(`/profiles/${address}/collected`);
      }, [router, address])}
    >
      {({ active }) => (
        <div
          className={clsx(
            'flex cursor-pointer flex-row items-center justify-between rounded-md p-4 hover:bg-gray-700',
            { 'bg-gray-800': active }
          )}
        >
          <div className="flex flex-row items-center gap-6">
            <div className="flex h-10 w-10 overflow-clip rounded-full bg-gray-700">
              <img
                src={image}
                alt={`profile-${address}`}
                className="min-h-full min-w-full object-cover"
              />
            </div>
            <p className="m-0 text-sm font-bold text-white">
              {profile?.displayName || profile?.address}
            </p>
          </div>
          <p className="m-0 text-sm text-gray-300 md:inline-block">{profile?.shortAddress}</p>
        </div>
      )}
    </Combobox.Option>
  );
}

Search.Profile = ProfileSearchResult;

interface SearchLoadingProps {
  variant?: 'square' | 'circle';
}

function SearchLoadingItem({ variant = 'square' }: SearchLoadingProps): JSX.Element {
  return (
    <div className="flex flex-row items-center justify-between p-4">
      <div className="flex flex-row items-center gap-6">
        <div
          className={clsx('h-12 w-12 animate-pulse bg-gray-800', {
            'rounded-full': variant === 'circle',
            'rounded-md': variant === 'square',
          })}
        />
        <div className="h-5 w-24 animate-pulse rounded-md bg-gray-800" />
      </div>
      <div>
        <div className="h-5 w-36 animate-pulse rounded-md bg-gray-800" />
      </div>
    </div>
  );
}

Search.Loading = SearchLoadingItem;
