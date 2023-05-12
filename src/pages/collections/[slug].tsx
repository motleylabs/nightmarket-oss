/* eslint-disable no-console */
import { Disclosure } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useWindowSize } from '@react-hook/window-size';
import { useWallet } from '@solana/wallet-adapter-react';

import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { useForm, Controller } from 'react-hook-form';
import useSWRInfinite from 'swr/infinite';

import cardGridLargeActiveIcon from '../../../public/images/card-grid-large-active.svg';
import cardGridLargeIcon from '../../../public/images/card-grid-large.svg';
import cardGridSmallActiveIcon from '../../../public/images/card-grid-small-active.svg';
import cardGridSmallIcon from '../../../public/images/card-grid-small.svg';
import cardListActiveIcon from '../../../public/images/card-list-active.svg';
import cardListIcon from '../../../public/images/card-list.svg';
import config from '../../app.config';
import { Attribute } from '../../components/Attribute';
import Button, {
  ButtonBackground,
  ButtonBorder,
  ButtonColor,
  ButtonSize,
} from '../../components/Button';
import { Buyable } from '../../components/Buyable';
import { Form } from '../../components/Form';
import { List, ListGridSize } from '../../components/List';
import { Preview } from '../../components/Nft';
import { Offerable } from '../../components/Offerable';
import Select from '../../components/Select';
import type { PillItem } from '../../components/Sidebar';
import { Sidebar } from '../../components/Sidebar';
import { Toggle } from '../../components/Toggle';
import { Toolbar } from '../../components/Toolbar';
import useSidebar from '../../hooks/sidebar';
import { api } from '../../infrastructure/api';
import CollectionLayout from '../../layouts/CollectionLayout';
import type { Collection, CollectionNftsData } from '../../typings';
import type { Nft } from '../../typings';

const PAGE_LIMIT = 24;

type PriceFilterForm = {
  priceMin: number;
  priceMax: number;
};

type PriceFilter = {
  min: string;
  max: string;
};

export async function getServerSideProps({ locale, params, res }: GetServerSidePropsContext) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate');

  const start1 = Date.now();
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'collection',
    'nft',
    'buyable',
    'analytics',
  ]);
  console.log('i18n', Date.now() - start1);

  const start2 = Date.now();
  console.log('api', Date.now() - start2);

  const start3 = Date.now();
  const { data } = await api.get<Collection>(`/collections/${params?.slug}`);
  console.log('data', Date.now() - start3);

  if (data == null) {
    return {
      notFound: true,
    };
  }

  const start4 = Date.now();
  data.attributes?.map((attribute) => {
    if (attribute.values.length > 0) {
      const total = attribute.values.reduce((acc, item) => acc + item.counts, 0);
      attribute.values.map((valueItem) => {
        valueItem.percent = Math.round((valueItem.counts / total) * 10000) / 100;
      });
    }
  });
  console.log('data.attributes', Date.now() - start4);

  return {
    props: {
      collection: data,
      ...i18n,
    },
  };
}

enum SortType {
  Price = 'price',
  RecentlyListed = 'timestamp',
  Rarity = 'moonrank',
  LastSale = 'last_sale_price',
}

interface CollectionNFTForm {
  attributes: { [key: string]: { type: string; values: string[] } };
  sortBySelect: string;
}

interface SortOption {
  label: string;
  value: string;
}

type CollectionNftsProps = {
  collection: Collection;
};

export default function CollectionNfts({ collection }: CollectionNftsProps) {
  const { t } = useTranslation(['collection', 'common']);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [windowWidth] = useWindowSize();

  const sortOptions: SortOption[] = [
    {
      value: `${SortType.Price}:asc`,
      label: t('sort.priceLowToHigh', { ns: 'collection' }),
    },
    {
      value: `${SortType.Price}:desc`,
      label: t('sort.priceHighToLow', { ns: 'collection' }),
    },
    {
      value: `${SortType.RecentlyListed}:desc`,
      label: t('sort.recentlyListed', { ns: 'collection' }),
    },
    {
      value: `${SortType.Rarity}:asc`,
      label: t('sort.rarityLowToHigh', { ns: 'collection' }),
    },
    {
      value: `${SortType.Rarity}:desc`,
      label: t('sort.rarityHighToLow', { ns: 'collection' }),
    },
    {
      value: `${SortType.LastSale}:asc`,
      label: t('sort.lastSaleLowToHigh', { ns: 'collection' }),
    },
    {
      value: `${SortType.LastSale}:desc`,
      label: t('sort.lastSaleHighToLow', { ns: 'collection' }),
    },
  ];

  const miniCollection = useMemo(
    () => ({
      slug: collection.slug,
      name: collection.name,
      floorPrice: collection.statistics.floor1d,
    }),
    [collection.name, collection.slug, collection.statistics.floor1d]
  );

  const { watch, control, setValue } = useForm<CollectionNFTForm>({
    defaultValues: { sortBySelect: sortOptions[0].value, attributes: {} },
  });

  const attributes = watch('attributes');
  const selectedSort = watch('sortBySelect');

  const querySelectedAttributes = useMemo(
    () =>
      Object.entries(attributes)
        .map(([name, { type, values }]) => ({
          name,
          type,
          values,
        }))
        .flat(),
    [attributes]
  );

  const { publicKey } = useWallet();

  const { query } = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [isLive, setIsLive] = useState<boolean>(false);
  const [nftName, setNftName] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: '', max: '' });
  const {
    register,
    formState: { errors: priceErrors },
    handleSubmit: handlePriceSubmit,
    reset: resetPrice,
    getValues,
  } = useForm<PriceFilterForm>();

  const handlePriceFilter = async (form: PriceFilterForm) => {
    const updatedFilter = {
      min: '',
      max: '',
    };
    if (form.priceMin > 0) {
      updatedFilter.min = `${form.priceMin}`;
    }
    if (form.priceMax > 0) {
      updatedFilter.max = `${form.priceMax}`;
    }
    setPriceFilter(updatedFilter);
  };

  const [listingOnly, setListingOnly] = useState<boolean>(false);
  const [nightmarketOnly, setNightmarketOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('price');
  const [orderBy, setOrderBy] = useState<string>('asc');

  const selectedAttributes: PillItem[] = useMemo(() => {
    const pillItems = Object.entries(attributes)
      .map(([group, attributes]) =>
        attributes.values?.map((a) => {
          return { key: `${group}:${a}`, label: `${group}: ${a}` };
        })
      )
      .flat();

    if (priceFilter.min !== '' || priceFilter.max !== '') {
      pillItems.unshift({
        key: 'price',
        label: `price: ${priceFilter.min !== '' ? priceFilter.min : '0'} -> ${
          priceFilter.max !== '' ? priceFilter.max : 'Infinity'
        }`,
      });
    }

    if (nftName !== '') {
      pillItems.unshift({
        key: 'name',
        label: `NFT Name: ${nftName}`,
      });
    }

    if (listingOnly) {
      pillItems.unshift({
        key: 'sale',
        label: `For Sale`,
      });
    }

    if (nightmarketOnly) {
      pillItems.unshift({
        key: 'nightmarket',
        label: `Night Market Only`,
      });
    }

    return pillItems;
  }, [attributes, listingOnly, nftName, nightmarketOnly, priceFilter.max, priceFilter.min]);

  const getKey = (pageIndex: number, previousPageData: CollectionNftsData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    const attributesQueryParam = encodeURIComponent(JSON.stringify(querySelectedAttributes));

    return `/collections/nfts?sort_by=${sortBy}&order=${orderBy}&limit=${PAGE_LIMIT}&offset=${
      pageIndex * PAGE_LIMIT
    }&attributes=${attributesQueryParam}&address=${query.slug}&auction_house=${
      config.auctionHouse
    }&program=${nightmarketOnly ? config.auctionHouseProgram ?? '' : ''}&name=${Buffer.from(
      nftName,
      'utf8'
    ).toString('base64')}&min=${priceFilter.min}&max=${priceFilter.max}&listing_only=${
      listingOnly ? 'true' : 'false'
    }`;
  };

  useEffect(() => {
    const [selectedSortBy, selectedOrderBy] = selectedSort.split(':');
    setSortBy(selectedSortBy);
    setOrderBy(selectedOrderBy);
  }, [selectedSort]);

  const { data, setSize, isValidating, mutate } = useSWRInfinite<CollectionNftsData>(getKey);

  const isLoading = useMemo(() => !data && isValidating, [data, isValidating]);
  const hasNextPage = useMemo(() => Boolean(data?.every((d) => d.hasNextPage)), [data]);
  const [cardType, setCardType] = useState<string>('grid-small');

  useEffect(() => {
    setCardType(windowWidth > 640 ? 'grid-small' : 'grid-large');
  }, [windowWidth]);

  const onShowMoreNfts = () => {
    setSize((oldSize) => oldSize + 1);
  };

  const clearPriceFilter = useCallback(() => {
    setPriceFilter({ min: '', max: '' });
    resetPrice();
  }, [resetPrice]);

  const onClearPills = useCallback(() => {
    setValue('attributes', {});
    clearPriceFilter();
    setNftName('');
    setNightmarketOnly(false);
    setListingOnly(false);
  }, [clearPriceFilter, setValue]);

  const onRemovePill = useCallback(
    (item: PillItem) => {
      switch (item.key) {
        case 'price':
          clearPriceFilter();
          break;
        case 'name':
          setNftName('');
          break;
        case 'sale':
          setListingOnly(false);
          break;
        case 'nightmarket':
          setNightmarketOnly(false);
          break;
        default:
          const [group, attribute] = item.key.split(':', 2);
          setValue('attributes', {
            ...attributes,
            [group]: {
              type: attributes[group].type,
              values: attributes[group].values.filter((a) => a !== attribute),
            },
          });
      }
    },
    [attributes, clearPriceFilter, setValue]
  );

  const nfts: Nft[] = useMemo(() => data?.flatMap((pageData) => pageData.nfts) ?? [], [data]);

  const isNotFound = useMemo(() => nfts.length === 0 && !isLoading, [isLoading, nfts.length]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control
          label={t('filters', { ns: 'collection' })}
          open={open}
          onChange={toggleSidebar}
          isLive={isLive}
          setIsLive={setIsLive}
          refresh={() => mutate()}
        />
        <div className="group relative block lg:w-[800px] md:w-[500px] md:my-0 sm:w-full my-3">
          <button
            type="button"
            onClick={useCallback(() => searchInputRef?.current?.focus(), [searchInputRef])}
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
            type="search"
            placeholder={t('search', { ns: 'collection' })}
            onChange={(e) => setNftName(e.target.value)}
            value={nftName}
            inputRef={searchInputRef}
          />
        </div>
        <div className="flex items-center">
          <Controller
            control={control}
            name="sortBySelect"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onChange={onChange}
                options={sortOptions}
                className="w-full md:w-40 lg:w-60 custom-scroll-bar-select text-left"
              />
            )}
          />
          <div
            className="sm:ml-3 ml-1 flex flex-none items-center justify-center rounded-full border-[1px] border-[#262626] w-[48px] h-[48px] cursor-pointer"
            onClick={() => setCardType('list')}
          >
            <Image
              src={cardType === 'list' ? cardListActiveIcon : cardListIcon}
              alt="card-list-icon"
            />
          </div>
          <div
            className="sm:ml-3 ml-1 flex flex-none items-center justify-center rounded-full border-[1px] border-[#262626] w-[48px] h-[48px] cursor-pointer"
            onClick={() => setCardType('grid-large')}
          >
            <Image
              src={cardType === 'grid-large' ? cardGridLargeActiveIcon : cardGridLargeIcon}
              alt="card-grid-large-icon"
            />
          </div>
          <div
            className="sm:ml-3 ml-1 sm:flex sm:flex-none hidden items-center justify-center rounded-full border-[1px] border-[#262626] w-[48px] h-[48px] cursor-pointer"
            onClick={() => setCardType('grid-small')}
          >
            <Image
              src={cardType === 'grid-small' ? cardGridSmallActiveIcon : cardGridSmallIcon}
              alt="card-grid-small-icon"
            />
          </div>
        </div>
      </Toolbar>
      <Sidebar.Page open={open}>
        <Sidebar.Panel onChange={toggleSidebar}>
          <div className="mt-4 flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div className="bg-gray-800 px-[20px] py-[12px] rounded-2xl">
                    <Disclosure.Button className="flex w-full items-center justify-between py-[8px]">
                      <span className="font-semibold capitalize text-white">Price range</span>
                      <div className="flex items-center ">
                        {open ? (
                          <ChevronUpIcon width={20} height={20} className="text-white" />
                        ) : (
                          <ChevronDownIcon width={20} height={20} className="text-white" />
                        )}
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className={'mt-3 mb-2'}>
                      <Form onSubmit={handlePriceSubmit(handlePriceFilter)}>
                        <div className="flex">
                          <div>
                            <Form.Input
                              placeholder="Min"
                              type="number"
                              step={0.001}
                              className="no-arrow-input"
                              {...register('priceMin', {
                                min: 0,
                                validate: () =>
                                  `${getValues('priceMax')}` === '' ||
                                  Number(getValues('priceMin')) <= Number(getValues('priceMax')),
                              })}
                              onKeyPress={(e) => {
                                if (e.key === 'e' || e.key === '-') {
                                  e.preventDefault();
                                }
                              }}
                            ></Form.Input>
                            <Form.Error message={priceErrors.priceMin?.message} />
                          </div>
                          <div className="relative items-center w-[20px] mx-2">
                            <span className="absolute top-1/2 w-full border-[1px] border-gray-700"></span>
                          </div>
                          <div>
                            <Form.Input
                              placeholder="Max"
                              type="number"
                              step={0.001}
                              className="no-arrow-input"
                              {...register('priceMax')}
                              onKeyPress={(e) => {
                                if (e.key === 'e' || e.key === '-') {
                                  e.preventDefault();
                                }
                              }}
                            ></Form.Input>
                            <Form.Error message={priceErrors.priceMax?.message} />
                          </div>
                        </div>
                        {!!priceErrors.priceMin && priceErrors.priceMin.type === 'validate' && (
                          <div className="mt-1">
                            <Form.Error message={t('priceMinMaxCompare', { ns: 'collection' })} />
                          </div>
                        )}
                        <Button
                          className="mt-3 w-full"
                          htmlType="submit"
                          size={ButtonSize.Large}
                          background={ButtonBackground.Slate}
                          border={ButtonBorder.Gradient}
                          color={ButtonColor.Gradient}
                        >
                          {t('apply', { ns: 'collection' })}
                        </Button>
                      </Form>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <div className="bg-gray-800 px-[20px] py-[12px] rounded-2xl">
                    <Disclosure.Button className="flex w-full items-center justify-between py-[8px]">
                      <span className="font-semibold capitalize text-white">Listing type</span>
                      <div className="flex items-center ">
                        {open ? (
                          <ChevronUpIcon width={20} height={20} className="text-white" />
                        ) : (
                          <ChevronDownIcon width={20} height={20} className="text-white" />
                        )}
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className={'mt-3 mb-2'}>
                      <div className="flex items-center justify-between">
                        <span className="text-white whitespace-nowrap mr-1 text-[14px]">
                          For Sale
                        </span>
                        <Toggle value={listingOnly} onChange={setListingOnly} />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-white whitespace-nowrap mr-1 text-[14px]">
                          Night Market Only
                        </span>
                        <Toggle value={nightmarketOnly} onChange={setNightmarketOnly} />
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
              {collection.attributes.length > 0 && (
                <Disclosure defaultOpen={true}>
                  {({ open }) => (
                    <div className="bg-gray-800 px-[20px] py-[12px] rounded-2xl">
                      <Disclosure.Button className="flex w-full items-center justify-between pb-3 py-[8px] border-b-[1px] border-[#323137]">
                        <span className="font-semibold capitalize text-white">Attributes</span>
                        <div className="flex items-center ">
                          {open ? (
                            <ChevronUpIcon width={20} height={20} className="text-white" />
                          ) : (
                            <ChevronDownIcon width={20} height={20} className="text-white" />
                          )}
                        </div>
                      </Disclosure.Button>
                      <Disclosure.Panel className={'mt-3 space-y-4'}>
                        {collection.attributes.map((group) => (
                          <div
                            key={`attribute-group-${group.name}`}
                            className="w-full rounded-2xl py-1"
                          >
                            <Disclosure>
                              {({ open }) => (
                                <>
                                  <Disclosure.Button className="flex w-full items-center justify-between">
                                    <Attribute.Header group={group} isOpen={open} />
                                  </Disclosure.Button>
                                  <Disclosure.Panel className={'mt-6 space-y-4'}>
                                    {group.values.map((valueItem) => (
                                      <Attribute.Option
                                        key={`attribute-${group.name}-${valueItem.value}`}
                                        variant={valueItem.value}
                                        count={valueItem.counts}
                                        percent={valueItem.percent}
                                        selected={attributes[group.name]?.values?.includes(
                                          valueItem.value
                                        )}
                                        onClick={() => {
                                          setValue('attributes', {
                                            ...attributes,
                                            [group.name]: {
                                              type: group.type,
                                              values: attributes[group.name]?.values?.includes(
                                                valueItem.value
                                              )
                                                ? attributes[group.name]?.values?.filter(
                                                    (a) => a !== valueItem.value
                                                  )
                                                : [
                                                    ...(attributes[group.name]?.values ?? []),
                                                    valueItem.value,
                                                  ],
                                            },
                                          });
                                        }}
                                      />
                                    ))}
                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          </div>
                        ))}
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              )}
            </div>
          </div>
        </Sidebar.Panel>
        <Sidebar.Content>
          <>
            {selectedAttributes.length > 0 && (
              <div className="gap-1 flex items-center">
                <span className="mb-4 mt-4 flex flex-wrap gap-2 md:mb-2 mr-1 text-gray-300 text-[12px]">
                  Filters:
                </span>
                <Sidebar.Pills
                  items={selectedAttributes}
                  onRemove={onRemovePill}
                  onClear={onClearPills}
                  clearButtonFirst={true}
                />
              </div>
            )}
            <Offerable connected={Boolean(publicKey)}>
              {({ makeOffer }) => (
                <Buyable connected={Boolean(publicKey)}>
                  {({ buyNow }) =>
                    isNotFound ? (
                      <div className="text-gray-200 my-6 w-full flex justify-center">
                        {t('empty', { ns: 'collection' })}
                      </div>
                    ) : (
                      <List
                        cardType={cardType}
                        expanded={open}
                        data={nfts}
                        loading={isLoading}
                        hasMore={hasNextPage}
                        gap={6}
                        grid={{
                          [ListGridSize.Default]: [1, 2, 2],
                          [ListGridSize.Small]: [1, 1, 2],
                          [ListGridSize.Medium]: [1, 2, 3],
                          [ListGridSize.Large]: [2, 3, 4],
                          [ListGridSize.ExtraLarge]: [3, 4, 6],
                          [ListGridSize.Jumbo]: [4, 6, 8],
                        }}
                        skeleton={Preview.Skeleton}
                        onLoadMore={onShowMoreNfts}
                        render={(nft, i) => (
                          <Preview
                            cardType={cardType}
                            key={`${nft.mintAddress}-${i}`}
                            link={`/nfts/${nft.mintAddress}`}
                            onMakeOffer={() => makeOffer(nft, miniCollection)}
                            onBuy={() =>
                              buyNow(nft, miniCollection, () => {
                                nfts.splice(i, 1);
                              })
                            }
                            nft={nft}
                            showCollectionThumbnail={false}
                            bulkSelectEnabled={false}
                          />
                        )}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        orderBy={orderBy}
                        setOrderBy={setOrderBy}
                      />
                    )
                  }
                </Buyable>
              )}
            </Offerable>
          </>
        </Sidebar.Content>
      </Sidebar.Page>
    </>
  );
}

interface CollectionNftsLayout {
  children: ReactElement;
  collection: Collection;
}

CollectionNfts.getLayout = function CollectionNftsLayout({
  children,
  collection,
}: CollectionNftsLayout): JSX.Element {
  return <CollectionLayout collection={collection}>{children}</CollectionLayout>;
};
