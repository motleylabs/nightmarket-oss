//           <List
//           data={nftsQuery.data?.nfts}
//           loading={nftsQuery.loading}
//           gap={4}
//           grid={{
//             xs: [1, 1],
//             sm: [2, 1],
//             md: [2, 3],
//             lg: [3, 4],
//             xl: [4, 6],
//             2xl: [6, 8]
//           }}
//         skeleton={NftCard.Skeleton}
//         onLoadMore={async (inView: boolean) => {
// ...
//         }}
//         render={(nft) => (
// ...
//         )}
//         />

import clsx from 'clsx';
import React, { ReactNode, useMemo } from 'react';

type ListGridSizeValue = [number, number]

enum ListGridSize {
  Default = 'default',
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  ExtraLarge = 'xl',
  Jumbo = '2xl',
}

interface ListGrid {
  [ListGridSize.Default]: ListGridSizeValue;
  [ListGridSize.Small]?: ListGridSizeValue;
  [ListGridSize.Medium]?: ListGridSizeValue;
  [ListGridSize.Large]?: ListGridSizeValue;
  [ListGridSize.ExtraLarge]?: ListGridSizeValue;
  [ListGridSize.Jumbo]?: ListGridSizeValue;
}

interface ListProps<T> {
  data: T[];
  gap: number;
  loading: boolean;
  grid: ListGrid;
  expanded?: boolean;
  render: (item: T) => JSX.Element;
  onLoadMore: (inView: boolean) => Promise<void>;
  skeleton: ReactNode;
  className?: string;
}

// open
// ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
// : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8'

export default function List<T>({ data, loading, gap, grid, skeleton, render, onLoadMore, expanded, className }: ListProps<T>): JSX.Element {

  const [openClassNames, closedClassNames] = useMemo(() => {
    const classNames = Object.entries(grid).reduce<[string[], string[]]>(([openClassNames, closedClassNames], [size, [open, closed]]) => {

      if (size === ListGridSize.Default) {
        openClassNames = [...openClassNames, `grid-cols-${open}`];
        closedClassNames = [...closedClassNames, `grid-cols-${closed}`];
      } else {
        openClassNames = [...openClassNames, `${size}:grid-cols-${open}`];
        closedClassNames = [...closedClassNames, `${size}:grid-cols-${closed}`];
      }

      return [openClassNames, closedClassNames]
    }, [[], []])

    return classNames
  }, [grid])

  return (
    <div className={clsx(openClassNames, closedClassNames, className)}>
      {loading ? (
        <div />
      ) : (
        data.map(render)
      )}
    </div>
  )
}