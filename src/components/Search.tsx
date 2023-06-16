/* eslint-disable no-console */

/* eslint-disable react/jsx-no-useless-fragment */
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { FC, ReactNode, useMemo } from 'react';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';

import { SearchMode } from '../hooks/globalsearch';
import { VerifiedBadge } from '../layouts/CollectionLayout';
import { shortenAddress } from '../modules/address';
import type { Nft, StatSearch } from '../typings';
import { AssetSize, getAssetURL } from '../utils/assets';
import Img from './Image';
import { useAction } from '../hooks/useAction';

type Input = FC;
type Group = FC;
type Header = FC;
type Results = FC;
type Loading = FC;
type CollectionItem = FC;
type ProfileItem = FC;
type NftItem = FC;

interface SearchProps {
  children: (open: boolean) => ReactNode;
  Input?: Input;
  Group?: Group;
  Header?: Header;
  Results?: Results;
  Loading?: Loading;
  Profile?: ProfileItem;
  Collection?: CollectionItem;
  MintAddress?: NftItem;
}

export default function Search({ children }: SearchProps) {
  const [selected, setSelected] = useState<(StatSearch & Nft) | null>(null);
  const router = useRouter();

  return (
    <Combobox
      value={selected}
      onChange={(selection) => {
        if (!selection) {
          // TODO: have a fallback to view these
          console.error('Missing verified collection address');
          return;
        }

        setSelected(selection);

        switch (selection.searchType) {
          case SearchMode.Collection:
            router.push(`/collections/${selection.slug}`);
            break;
          case SearchMode.Nft:
            router.push(`/nfts/${selection.mintAddress}`);
            break;
          case SearchMode.Profile:
            router.push(`/profiles/${selection.address}`);
            break;
          default:
            console.error('Unknown content whilst searching');
            break;
        }
      }}
    >
      {({ open }) => (
        <>
          <Combobox.Button
            className="md:w-full w-0"
            onClick={(e) => {
              if (open) {
                e.preventDefault();
              }
            }}
            as="div"
          >
            {children(open)}
          </Combobox.Button>
        </>
      )}
    </Combobox>
  );
}

interface SearchInputProps {
  comboOpened: boolean;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autofocus?: boolean;
}

function SearchInput({
  comboOpened,
  onChange,
  onFocus,
  onBlur,
  value,
  setValue,
  autofocus,
  className,
  placeholder,
}: SearchInputProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchKeyboardPrompt = useMemo(() => (comboOpened ? 'esc' : '/'), [comboOpened]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!comboOpened) {
        if (e.key === searchKeyboardPrompt) {
          e.preventDefault();
          e.stopPropagation();
          searchInputRef.current?.click();
        }
      }
    },
    [comboOpened, searchKeyboardPrompt]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={clsx('group relative block w-full transition-all', className)}>
      <button
        type="button"
        onClick={useCallback(() => searchInputRef?.current?.click(), [searchInputRef])}
        className="absolute left-4 flex h-full cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out hover:scale-105"
      >
        <MagnifyingGlassIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
      </button>
      <DebounceInput
        minLength={1}
        debounceTimeout={300}
        autoComplete="off"
        autoCorrect="off"
        className="block w-full rounded-full border-2 border-gray-900 bg-transparent py-2 pl-12 pr-6 text-base text-white transition-all focus:border-white focus:placeholder-gray-400 focus:outline-none hover:border-white md:py-2"
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        inputRef={searchInputRef}
        element={Combobox.Input}
        autoFocus={autofocus}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            if (searchInputRef.current) {
              searchInputRef.current.value = '';
              searchInputRef.current.blur();
              setValue('');
            }
          }
        }}
      />
      <button
        type="button"
        className="pointer-events-none absolute right-4 top-0 hidden h-full  items-center justify-center md:flex"
      >
        <kbd className=" hidden h-6 items-center justify-center rounded bg-gray-800 px-2 text-sm text-gray-300 group-focus-within:flex group-hover:flex">
          {searchKeyboardPrompt}
        </kbd>
      </button>
    </div>
  );
}
Search.Input = SearchInput;

interface SearchResultsProps {
  searching: boolean;
  children: ReactNode;
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
  hasResults: boolean;
  error?: unknown;
  enabled?: boolean;
}

function SearchResults({ searching, children, mode, setMode }: SearchResultsProps) {
  const { t } = useTranslation('common');

  return (
    <Transition
      as={Fragment}
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterLeave={() => null}
    >
      <Combobox.Options
        className={clsx('fixed left-0 right-0 top-12 bottom-0 z-40 mx-auto block max-w-4xl')}
      >
        <div className="scrollbar-thumb-rounded-full absolute top-4 z-50 h-[calc(100vh-45px)] w-full gap-6 overflow-y-scroll rounded-md bg-gray-900 p-4 shadow-lg shadow-black transition ease-in-out scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-700 md:top-10 md:max-h-96">
          <div className="mb-2 border-b border-gray-700 pt-4 text-base font-medium text-gray-300 flex">
            <span
              onClick={() => setMode('collection')}
              className={`px-2 mr-2 pb-2 ${
                mode === 'collection' ? 'border-b border-white text-white' : 'cursor-pointer'
              }`}
            >
              {t('search.collection', { ns: 'common' })}
            </span>
            <span
              onClick={() => setMode('nft')}
              className={`px-2 mr-2 pb-2 ${
                mode === 'nft' ? 'border-b border-white text-white' : 'cursor-pointer'
              }`}
            >
              {t('search.nfts', { ns: 'common' })}
            </span>
            <span
              onClick={() => setMode('profile')}
              className={`px-2 pb-2 ${
                mode === 'profile' ? 'border-b border-white text-white' : 'cursor-pointer'
              }`}
            >
              {t('search.profiles', { ns: 'common' })}
            </span>
          </div>
          {searching ? (
            <>
              <SearchLoadingItem />
              <SearchLoadingItem variant="circle" />
              <SearchLoadingItem />
              <SearchLoadingItem variant="circle" />
            </>
          ) : (
            children
          )}
        </div>
      </Combobox.Options>
    </Transition>
  );
}
Search.Results = SearchResults;

interface SearchGroupProps<T> {
  children: (data: { result: T | undefined }) => ReactNode;
  result?: T;
}

function SearchGroup<T>({ children, result }: SearchGroupProps<T>) {
  return <>{result instanceof Array && result.length > 0 && children({ result })}</>;
}
Search.Group = SearchGroup;

type SearchResultProps = {
  slug?: string;
  image?: string;
  name?: string;
  value?: StatSearch | Nft;
  isVerified?: boolean;
};

function CollectionSearchResult({ name, image, value, slug, isVerified }: SearchResultProps) {
  const { push } = useRouter();
  const { trigger } = useAction();

  return (
    <Combobox.Option
      key={`collection-${slug}`}
      value={value}
      onClick={useCallback(() => {
        trigger('refresh-collection');
        push(`/collections/${slug}`);
      }, [slug, push])}
    >
      {({ active }) => (
        <div
          className={clsx(
            'flex cursor-pointer flex-row items-center justify-between rounded-md p-4 hover:bg-gray-700',
            { 'bg-gray-700': active }
          )}
        >
          <div className="flex flex-row items-center gap-6">
            <Img
              fallbackSrc="/images/moon.svg"
              src={getAssetURL(image, AssetSize.XSmall)}
              alt={name || slug}
              className="aspect-square h-10 w-10 overflow-hidden rounded-md text-sm"
            />
            <div className="m-0 flex items-center">
              <span className="text-md text-white">{name}</span>
              {isVerified !== undefined && isVerified && (
                <VerifiedBadge width={30} height={30} isVerified={true} />
              )}
            </div>
          </div>
        </div>
      )}
    </Combobox.Option>
  );
}

Search.Collection = CollectionSearchResult;

type MintAddressSearchResultProps = SearchResultProps & { creator?: string };

function MintAddressSearchResult({
  slug,
  name,
  image,
  value,
  creator,
}: MintAddressSearchResultProps) {
  const router = useRouter();

  return (
    <Combobox.Option
      key={`nft-${slug}`}
      value={value}
      onClick={useCallback(() => {
        router.push(`/nfts/${slug}`);
      }, [router, slug])}
    >
      {({ active }) => (
        <div
          className={clsx(
            'flex cursor-pointer flex-row items-center justify-between rounded-md p-4 hover:bg-gray-700 ',
            { 'bg-gray-700': active }
          )}
        >
          <div className="flex flex-row items-center gap-6">
            <Img
              fallbackSrc="/images/moon.svg"
              src={getAssetURL(image, AssetSize.XSmall)}
              alt={name || slug}
              className="object-cover h-10 w-10 overflow-hidden rounded-md text-sm"
            />
            <p className="m-0 text-sm font-bold">{name}</p>
          </div>
          {creator && (
            <div className="flex items-center justify-end gap-4">
              <p className="m-0 hidden items-center gap-2 text-sm text-gray-300 md:flex">
                {creator}
              </p>
            </div>
          )}
        </div>
      )}
    </Combobox.Option>
  );
}

Search.MintAddress = MintAddressSearchResult;

type ProfileSearchResultProps = SearchResultProps;

function ProfileSearchResult({ value, slug, name }: ProfileSearchResultProps) {
  const router = useRouter();

  return (
    <Combobox.Option
      key={`profile-${slug}`}
      value={value}
      onClick={useCallback(() => {
        router.push(`/profiles/${slug}`);
      }, [router, slug])}
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
              <Img
                src="/images/moon.svg"
                alt={`profile-${slug}`}
                className="min-h-full min-w-full object-cover"
              />
            </div>
            <div>
              {name && <p className="m-0 text-md font-bold text-white">{name}</p>}
              {slug && (
                <p className="m-0 text-sm font-bold text-gray-300">{shortenAddress(slug)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Combobox.Option>
  );
}

Search.Profile = ProfileSearchResult;

interface SearchLoadingProps {
  variant?: 'square' | 'circle';
}

function SearchLoadingItem({ variant = 'square' }: SearchLoadingProps) {
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
