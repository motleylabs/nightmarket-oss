import clsx from 'clsx';

interface PriceProps {
  price: number;
  className?: string;
}

const Price = ({ price, className }: PriceProps) => (
  <div className={clsx('flex items-center gap-1', className)}>
    <span className="text-gray-300">◎</span>
    <span className="text-white">{price}</span>
  </div>
);

export default Price;
