import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { AttributeGroup, AttributeVariant } from '../graphql.types';

export function Attribute() {
  return <div />;
}

function AttributeOption({
  variant,
  selected,
}: {
  variant: AttributeVariant;
  selected: boolean;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white capitalize">{variant.name}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white">{variant.count}</span>
        {selected ? (
          <CheckIcon
            width={24}
            height={24}
            className="rounded-md border border-gray-400 bg-orange-600 px-0.5"
          />
        ) : (
          <div className="h-6 w-6 rounded-md border border-gray-400 bg-gray-700 px-0.5" />
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
      <span className="font-semibold text-white capitalize">{group.name}</span>
      <div className="flex items-center ">
        <span className="mr-4 flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm font-medium text-white">
          {group.variants.length}
        </span>
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
