import clsx from 'clsx';
import Icon from './Icon';

interface PriceProps {
  price: number;
  className?: string;
}

const Price = ({ price, className }: PriceProps) => (
  <div className={clsx('flex items-center', className)}>
    <Icon.Sol />
    <span className="text-white">{price}</span>
  </div>
);

export default Price;
