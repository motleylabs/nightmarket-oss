import clsx from 'clsx';
import Icon from './Icon';
import { Maybe } from '../graphql.types';

interface PriceProps {
  price: number | string | Maybe<string> | undefined;
  className?: string;
}

const Price = ({ price, className }: PriceProps) => (
  <div className={clsx('flex flex-row items-center gap-1', className)}>
    <Icon.Sol />
    <span className="text-white">{price}</span>
  </div>
);

export default Price;
