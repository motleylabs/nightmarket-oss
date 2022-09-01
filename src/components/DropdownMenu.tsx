import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { forwardRef, Fragment, ReactNode } from 'react';

const MyLink = forwardRef(function ForwardedLink(
  props: {
    href: string;
    children: ReactNode;
    [key: string]: any;
  },
  ref
) {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a
        // @ts-ignore // not able to type this ref
        ref={ref}
        {...rest}
      >
        {children}
      </a>
    </Link>
  );
});

export default function DropdownMenu(props: {
  children: ReactNode;
  items: {
    icon?: (props: React.ComponentProps<'svg'>) => JSX.Element;
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
  }[];
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className={(open) => open && 'bg-white'}>{props.children}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {props.items.map((i) => (
            <Menu.Item disabled={i.disabled} key={i.label}>
              {({ active }) =>
                i.href ? (
                  i.href.includes('https') ? (
                    <a className="w-full" href={i.href}>
                      {i.icon && <i.icon />}
                      {i.label}
                    </a>
                  ) : (
                    <MyLink href={i.href} className={` w-full ${active && 'bg-blue-500'}`}>
                      {i.label}
                    </MyLink>
                  )
                ) : (
                  <button className="flex w-full">
                    {i.icon && <i.icon />}

                    {i.label}
                  </button>
                )
              }
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
