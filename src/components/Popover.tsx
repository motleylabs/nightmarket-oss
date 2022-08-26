import { Popover as HeadlessPopover, Transition } from '@headlessui/react';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { usePopper } from 'react-popper';

export default function Popover(props: { href?: string; children: ReactNode; content: ReactNode }) {
  let [referenceElement, setReferenceElement] = useState<any>();
  let [popperElement, setPopperElement] = useState<any>();
  let { styles, attributes } = usePopper(referenceElement, popperElement);

  return (
    <HeadlessPopover className="relative">
      {props.href ? (
        <Link passHref href={props.href}>
          <HeadlessPopover.Button as="a" ref={setReferenceElement}>
            {props.children}
          </HeadlessPopover.Button>
        </Link>
      ) : (
        <HeadlessPopover.Button ref={setReferenceElement}>{props.children}</HeadlessPopover.Button>
      )}
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <HeadlessPopover.Panel
          className="absolute z-10"
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

// Seems to mess with popper, but can otherwise be wrapped around .Panel
{
  /* <Transition
enter="transition duration-100 ease-out"
enterFrom="transform scale-95 opacity-0"
enterTo="transform scale-100 opacity-100"
leave="transition duration-75 ease-out"
leaveFrom="transform scale-100 opacity-100"
leaveTo="transform scale-95 opacity-0"
> */
}
