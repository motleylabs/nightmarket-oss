import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

import type { CollectionAttribute } from '../typings';

export function Attribute() {
  return <div />;
}

function AttributeOption({
  variant,
  selected,
  count,
  percent,
  onClick,
}: {
  variant: string;
  selected: boolean;
  count: number;
  percent: number;
  onClick: () => void;
}): JSX.Element {
  return (
    <div onClick={onClick} className="flex cursor-pointer items-center justify-between">
      <span className="text-sm capitalize text-white">{variant}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {count} ({percent}%)
        </span>
        {selected ? (
          <CheckIcon className="h-4 w-4 cursor-pointer rounded-md bg-gradient-secondary px-0.5" />
        ) : (
          <div className="h-4 w-4 cursor-pointer rounded-md border border-gray-400 bg-gray-700 px-0.5" />
        )}
      </div>
    </div>
  );
}

Attribute.Option = AttributeOption;

function AttributeOptionHeader({
  group,
  isOpen,
}: {
  group: CollectionAttribute;
  isOpen: boolean;
}): JSX.Element {
  return (
    <>
      <span className="font-semibold capitalize text-gray-300">{group.name}</span>
      <div className="flex items-center ">
        {isOpen ? (
          <ChevronUpIcon width={16} height={16} className="text-white" />
        ) : (
          <ChevronDownIcon width={16} height={16} className="text-white" />
        )}
      </div>
    </>
  );
}

Attribute.Header = AttributeOptionHeader;

function AttributeOptionSkeleton(): JSX.Element {
  return <span className="mb-2 h-14 w-full animate-pulse rounded-2xl bg-gray-800" />;
}

Attribute.Skeleton = AttributeOptionSkeleton;
