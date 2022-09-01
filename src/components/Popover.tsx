import { Popover as HeadlessPopover, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Fragment, ReactNode, useState } from 'react';
import { usePopper } from 'react-popper';

export default function Popover(props: {
  panelClassNames?: string;
  children: ReactNode;
  content: ReactNode;
}) {
  let [referenceElement, setReferenceElement] = useState<any>();
  let [popperElement, setPopperElement] = useState<any>();
  let { styles, attributes } = usePopper(referenceElement, popperElement);

  return (
    <HeadlessPopover className="relative">
      <HeadlessPopover.Button ref={setReferenceElement} as="div">
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
          className={clsx('absolute z-10', props.panelClassNames)}
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
        >
          {props.content}
        </HeadlessPopover.Panel>
      </Transition>
    </HeadlessPopover>
  );
}
