import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface FilterLabelProps {
  key: string;
  label: string;
  onRemoveClick: () => void;
  className?: string;
}

const FilterLabel = ({ key, label, onRemoveClick, className }: FilterLabelProps) => (
  <div
    className={clsx(
      'rounded-full bg-primary-900 bg-opacity-10 py-2 px-4 text-sm text-primary-500',
      className
    )}
    key={key}
  >
    <div className="flex gap-2">
      {label}
      <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={onRemoveClick} />
    </div>
  </div>
);

export default FilterLabel;
