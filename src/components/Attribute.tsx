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
    <div className="mb-6 flex items-center justify-between">
      <span className="text-sm text-white">{variant.name}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white">{variant.count}</span>
        {selected ? (
          <CheckIcon
            width={24}
            height={24}
            className="rounded-md border border-gray-400 bg-white px-0.5"
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
    <div className="mb-4 flex items-center justify-between">
      <span className="text-lg text-white">{group.name}</span>
      <div className="flex items-center gap-4">
        <span className="rounded bg-gray-800 px-1 text-sm text-white">{group.variants.length}</span>
        {isOpen ? (
          <ChevronUpIcon width={24} height={24} className="text-white" />
        ) : (
          <ChevronDownIcon width={24} height={24} className="text-white" />
        )}
      </div>
    </div>
  );
}

Attribute.Header = AttributeOptionHeader;

function AttributeOptionSkeleton(): JSX.Element {
  return <span className="mb-4 h-8 w-full animate-pulse rounded bg-gray-800" />;
}

Attribute.Skeleton = AttributeOptionSkeleton;
