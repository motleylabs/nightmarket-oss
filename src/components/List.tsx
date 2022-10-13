import { useWindowWidth } from '@react-hook/window-size';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';

type ListGridSizeValue = [number, number];

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
  expanded?: boolean;
  hasMore: boolean;
  render: (item: T, index: number) => JSX.Element;
  onLoadMore: (inView: boolean) => Promise<void>;
  skeleton: (props: any) => JSX.Element;
  className?: string;
}

export function List<T>({
  data,
  loading,
  gap,
  grid,
  skeleton,
  render,
  onLoadMore,
  expanded,
  className,
  hasMore,
}: ListProps<T>): JSX.Element {
  const windowWidth = useWindowWidth();
  const Skeleton = skeleton;
  const [activeGridSize, setActiveGridSize] = useState(0);

  useEffect(() => {
    let nextGridSize: number;

    const activeGridIndex = expanded ? 0 : 1;

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
  }, [windowWidth, grid, expanded]);

  const [openClassNames, closedClassNames] = useMemo(() => {
    const classNames = Object.entries(grid).reduce<[string[], string[]]>(
      ([openClassNames, closedClassNames], [size, [open, closed]]) => {
        if (size === ListGridSize.Default) {
          openClassNames = [...openClassNames, `grid-cols-${open}`];
          closedClassNames = [...closedClassNames, `grid-cols-${closed}`];
        } else {
          openClassNames = [...openClassNames, `${size}:grid-cols-${open}`];
          closedClassNames = [...closedClassNames, `${size}:grid-cols-${closed}`];
        }

        return [openClassNames, closedClassNames];
      },
      [[], []]
    );

    return classNames;
  }, [grid]);

  return (
    <div
      className={clsx(
        `grid gap-4 pt-4 md:gap-${gap}`,
        expanded ? openClassNames : closedClassNames,
        className
      )}
    >
      {loading ? (
        [...Array(activeGridSize * 2)].map((_, index) => <Skeleton key={index} />)
      ) : (
        <>
          {data?.map(render)}
          {hasMore &&
            [...Array(activeGridSize)].map((_, index) => {
              if (index === 0) {
                return (
                  <InView onChange={onLoadMore} key={index}>
                    <Skeleton />
                  </InView>
                );
              } else {
                return <Skeleton key={index} />;
              }
            })}
        </>
      )}
    </div>
  );
}
