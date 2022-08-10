import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

export interface TabProps {
  href: string;
  children: ReactElement | ReactElement[];
  icon?: (props: any) => JSX.Element;
}

export default function Tab(props: TabProps): JSX.Element {
  const router = useRouter()

  return (
    <Link href={props.href} passHref>
      <a
        className={clsx(
          'flex flex-row flex-nowrap px-4 md:px-6 justify-center border-b py-2.5 text-center text-sm font-medium text-white',
          router.asPath === props.href ? ' border-white' : 'border-gray-800  text-gray-300 hover:text-white'
        )}
      >
        {props.icon && <props.icon className="mr-4 h-5 w-5" />}
        {props.children}
      </a>
    </Link>
  );
}