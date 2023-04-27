import { CheckIcon } from '@heroicons/react/24/outline';

import clsx from 'clsx';

interface CheckBoxProps {
  onClick: () => void;
  selected: boolean;
  label: string;
  containerClass?: string;
}

function CheckBox({ onClick, selected, label, containerClass }: CheckBoxProps): JSX.Element {
  return (
    <div
      onClick={onClick}
      className={clsx('flex cursor-pointer items-center gap-2', containerClass)}
    >
      <div className="flex items-center gap-4">
        {selected ? (
          <CheckIcon className="h-4 w-4 cursor-pointer rounded-md bg-gradient-secondary px-0.5 text-white" />
        ) : (
          <div className="h-4 w-4 cursor-pointer rounded-md border border-gray-200 bg-transparent px-0.5" />
        )}
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}

export default CheckBox;
