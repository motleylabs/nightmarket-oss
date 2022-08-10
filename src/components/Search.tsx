/* eslint-disable @next/next/no-img-element */
import React, { FC, Fragment, ReactNode, useRef, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/outline";
import { DebounceInput } from "react-debounce-input";
import Link from "next/link";
import { isPublicKey, shortenAddress } from "../util";
import { Wallet, Collection, Nft, UserWallet } from "../types";

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

export function Search({ children }: SearchProps) {
  const searchContainerRef = useRef<HTMLDivElement>(null!);
  const [selected, setSelected] = useState(null);

  return (
    <div
      id={"searchbar-container"}
      ref={searchContainerRef}
      className={
        "relative z-30 flex flex-row w-full items-center max-w-4xl text-white"
      }
    >
      <Combobox
        value={selected}
        onChange={(v) => {
          setSelected(v);
          console.log(v);
        }}
      >
        {children}
      </Combobox>
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

function SearchInput({ onChange, onFocus, onBlur, value }: SearchInputProps) {
  const searchInputRef = useRef<HTMLInputElement>(null!);

  return (
    <div className={"relative transition-all block w-full"}>
      <button
        onClick={() => searchInputRef?.current?.focus()}
        className={
          "absolute left-2 flex h-full items-center cursor-pointer rounded-full hover:scale-105 transition-all duration-300 ease-in-out group-focus-within:left-0 group-focus-within:scale-100 group-focus-within:bg-transparent group-focus-within:shadow-none md-left-0"
        }
      >
        <SearchIcon className={"h-5 w-5 text-white"} aria-hidden={"true"} />
      </button>
      <DebounceInput
        minLength={2}
        debounceTimeout={300}
        id={"search"}
        autoComplete={"off"}
        autoCorrect={"off"}
        autoCapitalize={"off"}
        className="block w-full rounded-full border border-transparent bg-transparent py-1 md:py-2 pl-10 pr-2 text-base placeholder-transparent transition-all focus:border-white focus:placeholder-gray-500 text-white focus:outline-none focus:ring-white sm:text-sm"
        type="search"
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={value || "Search"}
        onChange={onChange}
        inputRef={searchInputRef}
        element={Combobox.Input}
      />
    </div>
  );
}
Search.Input = SearchInput;

interface SearchResultsProps {
  searching: boolean;
  children: ReactNode;
  error?: any;
  hasResults: boolean;
}

function SearchResults({
  searching,
  children,
  hasResults,
}: SearchResultsProps) {
  return (
    <Transition
      as={Fragment}
      leave={"transition ease-in duration-100"}
      leaveFrom={"opacity-100"}
      leaveTo={"opacity-0"}
      afterLeave={() => {}}
    >
      <Combobox.Options
        className={
          "h-content scrollbar-thumb-rounded-full absolute top-12 z-50 max-h-screen-95 w-full p-4 gap-6 overflow-y-auto rounded-lg bg-gray-900 shadow-lg shadow-black transition ease-in-out scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-900"
        }
      >
        {searching ? (
          <>
            <SearchLoadingItem />
            <SearchLoadingItem variant={"circle"} />
            <SearchLoadingItem />
            <SearchLoadingItem variant={"circle"} />
          </>
        ) : (
          <>
            {!hasResults && (
              <div className={`flex h-6 w-full items-center justify-center`}>
                <p className={`m-0 text-center text-base font-medium`}>
                  No Results
                </p>
              </div>
            )}
            {children}
          </>
        )}
      </Combobox.Options>
    </Transition>
  );
}
Search.Results = SearchResults;

interface SearchGroupProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  results: UserWallet[] | Collection[] | UserWallet | Nft[] | undefined;
}

function SearchGroup({ title, subtitle, children, results }: SearchGroupProps) {
  if (!results) {
    return null;
  }
  if ("length" in results && results.length <= 0) {
    return null;
  }

  if ("profile" in results && !results.profile) {
    return null;
  }

  return (
    <>
      <h6
        className={
          "pt-4 text-base font-medium text-gray-300 pb-2 border-gray-500 border-b mb-2"
        }
      >
        {title}
      </h6>
      {children}
    </>
  );
}
Search.Group = SearchGroup;

interface SearchResultProps {
  address: string;
  image: string;
  name: string;
  active?: boolean;
  onClick?: () => void;
}

interface CollectionSearchResultProps extends SearchResultProps {
  count?: number;
  floor?: number;
}

function CollectionSearchResult({
  name,
  image,
  address,
  onClick,
  active,
  count,
  floor,
}: CollectionSearchResultProps) {
  return (
    <Link href={`/nfts/${address}`}>
      <a
        onClick={onClick}
        className={`flex flex-row items-center justify-between rounded-lg p-4 hover:bg-gray-800 ${
          active && "bg-gray-800"
        }`}
      >
        <div className={`flex flex-row items-center gap-6`}>
          <img
            src={image || "/images/placeholder.png"}
            alt={name}
            className={`aspect-square h-10 w-10 overflow-hidden rounded-lg text-sm`}
          />
          <p className={`m-0 text-sm font-bold`}>{name}</p>
        </div>
        {count && floor && (
          <div className={`flex items-center justify-end gap-4`}>
            <p
              className={`m-0 hidden items-center gap-2 text-sm text-gray-300 md:flex`}
            >
              {count} NFTs
            </p>
            <p
              className={`m-0 hidden items-center gap-2 text-sm text-gray-300 md:flex`}
            >
              Floor {floor}
            </p>
          </div>
        )}
      </a>
    </Link>
  );
}
Search.Collection = CollectionSearchResult;

interface MintAddressSearchResultProps extends SearchResultProps {
  creatorAddress?: string | null;
  creatorHandle?: string | null;
}

function MintAddressSearchResult({
  creatorAddress,
  creatorHandle,
  address,
  name,
  image,
  onClick,
  active,
}: MintAddressSearchResultProps) {
  return (
    <Link href={`/nfts/${address}`}>
      <a
        onClick={onClick}
        className={`flex flex-row items-center justify-between rounded-lg p-4 hover:bg-gray-800 ${
          active && "bg-gray-800"
        }`}
      >
        <div className={`flex flex-row items-center gap-6`}>
          <img
            src={image || "/images/placeholder.png"}
            alt={name}
            className={`aspect-square h-10 w-10 overflow-hidden rounded-lg text-sm`}
          />
          <p className={`m-0 text-sm font-bold`}>{name}</p>
        </div>
        {(creatorAddress || creatorHandle) && (
          <div className={`flex items-center justify-end gap-4`}>
            <p
              className={`m-0 hidden items-center gap-2 text-sm text-gray-300 md:flex`}
            >
              {`@${creatorHandle}` || shortenAddress(creatorAddress || "")}
            </p>
          </div>
        )}
      </a>
    </Link>
  );
}
Search.MintAddress = MintAddressSearchResult;

interface ProfileSearchResultProps extends SearchResultProps {
  handle: string;
}

function ProfileSearchResult({
  handle,
  name,
  image,
  address,
  onClick,
  active,
}: ProfileSearchResultProps) {
  if (!isPublicKey(address)) {
    return null;
  }

  return (
    <Link href={`/profiles/${address}`}>
      <a
        onClick={onClick}
        className={`flex flex-row items-center justify-between rounded-lg p-4 hover:bg-gray-800 ${
          active && "bg-gray-800"
        }`}
      >
        <div className={"flex flex-row items-center gap-6"}>
          <div
            className={"flex overflow-clip rounded-full bg-gray-900 h-10 w-10"}
          >
            <img
              src={image || "/images/placeholder.png"}
              alt={`profile-${address}`}
              className={"min-h-full min-w-full object-cover "}
            />
          </div>
          <p className={`m-0 text-sm text-white font-bold`}>
            {handle ? `@${handle}` : shortenAddress(address)}
          </p>
        </div>
        <p className={`m-0 hidden text-sm text-gray-300 md:inline-block`}>
          {shortenAddress(address)}
        </p>
      </a>
    </Link>
  );
}
Search.Profile = ProfileSearchResult;

interface SearchLoadingProps {
  variant?: "square" | "circle";
}

function SearchLoadingItem({ variant = "square" }: SearchLoadingProps) {
  return (
    <div className={`flex flex-row items-center justify-between p-4`}>
      <div className={`flex flex-row items-center gap-6`}>
        <div
          className={`h-12 w-12 ${
            variant === `circle` ? `rounded-full` : `rounded-lg`
          } animate-pulse bg-gray-800`}
        />
        <div className={`h-5 w-24 animate-pulse rounded-md bg-gray-800`} />
      </div>
      <div>
        <div className={`h-5 w-36 animate-pulse rounded-md bg-gray-800`} />
      </div>
    </div>
  );
}
Search.Loading = SearchLoadingItem;
