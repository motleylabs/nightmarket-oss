import { Popover as HeadlessPopover, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment, ReactNode, useEffect, useRef, useState } from 'react';
import { usePopper } from 'react-popper';

export default function Popover({
  toggledPopperElement = () => {},
  ...props
}: {
  panelClassNames?: string;
  toggledPopperElement?: () => void;
  children: ReactNode;
  content: ReactNode;
}) {
  const [referenceElement, setReferenceElement] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();

  const { styles, attributes } = usePopper(referenceElement, popperElement);

  const contentRef = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (contentRef?.current && !contentRef?.current?.contains(event.target as Node)) {
        toggledPopperElement();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contentRef, toggledPopperElement]);

  return (
    <HeadlessPopover className="relative">
      <HeadlessPopover.Button onClick={toggledPopperElement} as={'div'} ref={setReferenceElement}>
        {props.children}
      </HeadlessPopover.Button>
      <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <HeadlessPopover.Panel
          className={clsx('absolute z-20', props.panelClassNames)}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          <div ref={contentRef}>{props.content}</div>
        </HeadlessPopover.Panel>
      </Transition>
    </HeadlessPopover>
  );
}
