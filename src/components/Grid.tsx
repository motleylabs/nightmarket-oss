import clsx from 'clsx';

import { FlexAlign, FlexDirection, FlexJustify } from './Flex';

interface RowProps {
  children: JSX.Element | undefined | null | (JSX.Element | null | undefined)[];
  className?: string;
  align?: FlexAlign;
  justify?: FlexJustify;
  block?: boolean;
}

export function Row({ children, className, align, justify, block }: RowProps): JSX.Element {
  return (
    <div className={clsx('grid grid-cols-12', align, justify, { 'w-full': block }, className)}>
      {children}
    </div>
  );
}

interface ColProps {
  children: JSX.Element | undefined | boolean | null | (JSX.Element | boolean | null | undefined)[];
  className?: string;
  align?: FlexAlign;
  direction?: FlexDirection;
  justify?: FlexJustify;
  span: number;
  gap?: number;
}

export function Col({
  children,
  className,
  align,
  justify,
  span,
  direction = FlexDirection.Row,
  gap = 0,
}: ColProps): JSX.Element {
  return (
    <div
      className={clsx(
        'flex',
        direction,
        align,
        justify,
        `col-span-${span}`,
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
}
