import { ArrowSmallUpIcon, ArrowSmallDownIcon } from '@heroicons/react/24/outline';

interface SortingArrowProps {
  sortBy: string;
  orderBy: string;
  field: string;
}

export const SortingArrow = ({ orderBy, sortBy, field }: SortingArrowProps) => {
  return (
    <div className="relative w-[18px] h-[20px]">
      <ArrowSmallUpIcon
        color={`${sortBy === field && orderBy === 'asc' ? '#FFFFFF' : '#4C4C4C'}`}
        className="absolute left-0 top-[15%] h-3 w-3"
      />
      <ArrowSmallDownIcon
        color={`${sortBy === field && orderBy !== 'asc' ? '#FFFFFF' : '#4C4C4C'}`}
        className="absolute right-0 bottom-[15%] h-3 w-3"
      />
    </div>
  );
};
