import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { AttributeGroup, AttributeVariant } from '../graphql.types';

export function Attribute() {
  return <div />;
}

function AttributeOption({
  variant,
  selected,
  onClick,
}: {
  variant: AttributeVariant;
  selected: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <div onClick={onClick} className="flex cursor-pointer items-center justify-between">
      <span className="text-sm capitalize text-white">{variant.name}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">{variant.count}</span>
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
  group: AttributeGroup;
  isOpen: boolean;
}): JSX.Element {
  return (
    <>
      <span className="font-semibold capitalize text-white">{group.name}</span>
      <div className="flex items-center ">
        {/* Group Variants Count */}
        {/* <span className="mr-4 flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm font-medium text-white">
          {group.variants.length}
        </span> */}
        {isOpen ? (
          <ChevronUpIcon width={24} height={24} className="text-white" />
        ) : (
          <ChevronDownIcon width={24} height={24} className="text-white" />
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
