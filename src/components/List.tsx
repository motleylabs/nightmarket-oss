import { useWindowWidth } from '@react-hook/window-size';

import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import type { SetStateAction, Dispatch } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { SortingArrow } from './SortingArrow';

type ListGridSizeValue = [number, number, number];

export enum ListGridSize {
  Default = 'default',
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  ExtraLarge = 'xl',
  Jumbo = '2xl',
}

interface ListGrid {
  [ListGridSize.Default]: ListGridSizeValue;
  [ListGridSize.Small]: ListGridSizeValue;
  [ListGridSize.Medium]: ListGridSizeValue;
  [ListGridSize.Large]: ListGridSizeValue;
  [ListGridSize.ExtraLarge]: ListGridSizeValue;
  [ListGridSize.Jumbo]: ListGridSizeValue;
}

interface ListProps<T> {
  data: T[] | undefined;
  gap: number;
  loading: boolean;
  grid: ListGrid;
  hasMore: boolean;
  cardType: string;
  render: (item: T, index: number) => JSX.Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skeleton: (props: any) => JSX.Element;
  onLoadMore?: (inView: boolean) => Promise<void>;
  className?: string;
  expanded?: boolean;
  sortBy?: string;
  setSortBy?: Dispatch<SetStateAction<string>>;
  orderBy?: string;
  setOrderBy?: Dispatch<SetStateAction<string>>;
}

export function List<T>({
  data,
  gap,
  grid,
  cardType,
  skeleton,
  render,
  onLoadMore,
  expanded,
  className,
  hasMore,
  sortBy,
  setSortBy,
  orderBy,
  setOrderBy,
}: ListProps<T>): JSX.Element {
  const windowWidth = useWindowWidth();
  const Skeleton = skeleton;
  const [activeGridSize, setActiveGridSize] = useState(0);

  useEffect(() => {
    let nextGridSize: number;

    const activeGridIndex = cardType === 'grid-large' ? (expanded ? 0 : 1) : expanded ? 1 : 2;

    if (windowWidth >= 1536) {
      nextGridSize = grid[ListGridSize.Jumbo][activeGridIndex];
    } else if (windowWidth >= 1280) {
      nextGridSize = grid[ListGridSize.ExtraLarge][activeGridIndex];
    } else if (windowWidth >= 1024) {
      nextGridSize = grid[ListGridSize.Large][activeGridIndex];
    } else if (windowWidth >= 768) {
      nextGridSize = grid[ListGridSize.Medium][activeGridIndex];
    } else if (windowWidth >= 640) {
      nextGridSize = grid[ListGridSize.Small][activeGridIndex];
    } else {
      nextGridSize = grid[ListGridSize.Default][activeGridIndex];
    }

    setActiveGridSize(nextGridSize);
  }, [windowWidth, grid, expanded, cardType]);

  const [openClassNames, closedClassNames] = useMemo(() => {
    const classNames = Object.entries(grid).reduce<[string[], string[]]>(
      ([openClassNames, closedClassNames], [size, [large, medium, small]]) => {
        if (size === ListGridSize.Default) {
          openClassNames = [
            ...openClassNames,
            `grid-cols-${cardType === 'grid-large' ? large : medium}`,
          ];
          closedClassNames = [
            ...closedClassNames,
            `grid-cols-${cardType === 'grid-large' ? medium : small}`,
          ];
        } else {
          openClassNames = [
            ...openClassNames,
            `${size}:grid-cols-${cardType === 'grid-large' ? large : medium}`,
          ];
          closedClassNames = [
            ...closedClassNames,
            `${size}:grid-cols-${cardType === 'grid-large' ? medium : small}`,
          ];
        }

        return [openClassNames, closedClassNames];
      },
      [[], []]
    );

    return classNames;
  }, [cardType, grid]);

  const sort = (field: string) => {
    if (!!setOrderBy) {
      setOrderBy((oldOrder) => (field !== sortBy ? 'asc' : oldOrder === 'asc' ? 'desc' : 'asc'));
    }

    if (!!setSortBy) {
      setSortBy(field);
    }
  };

  return (
    <InfiniteScroll
      dataLength={data?.length ?? 0}
      next={() => {
        if (!!onLoadMore) onLoadMore(true);
      }}
      hasMore={hasMore}
      loader={
        cardType.includes('list') ? (
          <>
            <div className="h-16 mb-2 animate-pulse rounded-[10px] bg-gray-800" />
            <div className="h-16 mb-2 animate-pulse rounded-[10px] bg-gray-800" />
            <div className="h-16 mb-2 animate-pulse rounded-[10px] bg-gray-800" />
            <div className="h-16 mb-2 animate-pulse rounded-[10px] bg-gray-800" />
          </>
        ) : (
          [...Array(activeGridSize * 2)].map((_, index) => <Skeleton key={index} />)
        )
      }
      className={clsx(
        cardType.includes('list') ? '' : `grid gap-4 pt-4 md:gap-${gap}`,
        expanded ? openClassNames : closedClassNames,
        className
      )}
    >
      {cardType.includes('list') ? (
        <table className="nfts-table w-full bg-transparent border-separate border-spacing-x-0 border-spacing-y-2">
          <thead>
            <tr className="bg-transparent w-full">
              <th
                onClick={() => sort('name')}
                className="text-[12px] text-gray-300 text-left px-3 cursor-pointer w-[20%]"
              >
                <span className="flex items-center">
                  Name &nbsp;
                  <SortingArrow sortBy={sortBy ?? ''} field="name" orderBy={orderBy ?? ''} />
                </span>
              </th>
              <th
                onClick={() => sort('moonrank')}
                className="text-[12px] text-gray-300 text-left cursor-pointer w-[12%]"
              >
                <span className="flex items-center">
                  Rarity &nbsp;
                  <SortingArrow sortBy={sortBy ?? ''} field="moonrank" orderBy={orderBy ?? ''} />
                </span>
              </th>
              <th
                onClick={() => sort('price')}
                className="text-[12px] text-gray-300 text-left cursor-pointer w-[12%]"
              >
                <span className="flex items-center">
                  Price &nbsp;
                  <SortingArrow sortBy={sortBy ?? ''} field="price" orderBy={orderBy ?? ''} />
                </span>
              </th>
              <th
                onClick={() => sort('marketplace')}
                className="text-[12px] text-gray-300 text-left cursor-pointer w-[10%]"
              >
                <span className="flex items-center">
                  Market &nbsp;
                  <SortingArrow sortBy={sortBy ?? ''} field="marketplace" orderBy={orderBy ?? ''} />
                </span>
              </th>
              <th
                onClick={() => sort('last_sale_price')}
                className="text-[12px] text-gray-300 text-left cursor-pointer w-[12%]"
              >
                <span className="flex items-center">
                  Last sale &nbsp;
                  <SortingArrow
                    sortBy={sortBy ?? ''}
                    field="last_sale_price"
                    orderBy={orderBy ?? ''}
                  />
                </span>
              </th>
              <th
                onClick={() => sort('owner')}
                className="text-[12px] text-gray-300 text-left cursor-pointer w-[12%]"
              >
                <span className="flex items-center">
                  Owner &nbsp;
                  <SortingArrow sortBy={sortBy ?? ''} field="owner" orderBy={orderBy ?? ''} />
                </span>
              </th>
              <th
                onClick={() => sort('timstamp')}
                className="text-[12px] text-gray-300 text-left cursor-pointer w-[12%]"
              >
                <span className="flex items-center">
                  Price update &nbsp;
                  <SortingArrow sortBy={sortBy ?? ''} field="timestamp" orderBy={orderBy ?? ''} />
                </span>
              </th>
              <th className="text-[12px] text-gray-300 text-left cursor-pointer w-[80px] w-[10%]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>{data?.map(render)}</tbody>
        </table>
      ) : (
        data?.map(render)
      )}
    </InfiniteScroll>
  );
}
