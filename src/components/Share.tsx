import { Popover, Transition } from '@headlessui/react';
import { ArrowUpTrayIcon, CheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React, { Fragment, useState } from 'react';
import useClipboard from '../hooks/clipboard';
import Button, { ButtonSize, ButtonType } from './Button';

export default function Share(props: {
  address: string;
  twitterParams: {
    text: string;
    hashtags: string[];
    url: string;
  };
  forceDirection?: 'left';
}) {
  const { t } = useTranslation('common');

  const { copyText, copied } = useClipboard(props.twitterParams.url);

  return (
    <Popover>
      <Popover.Button as="div">
        <Button
          circle
          icon={<ArrowUpTrayIcon width={20} height={20} />}
          size={ButtonSize.Small}
          type={ButtonType.Tertiary}
        />
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Popover.Panel
          className={clsx(
            'absolute z-20 translate-y-2 ',
            props.forceDirection && '-translate-x-[calc(208px-40px)]'
          )}
        >
          <ul
            className="w-52
        overflow-hidden
        rounded-md
        bg-gray-950
        p-4
        text-white
      "
          >
            <li className="w-full">
              {copied ? (
                <div className="flex items-center">
                  <CheckIcon className="h-4 w-4" /> <span className="pl-5">{t('copied')}</span>
                </div>
              ) : (
                <button onClick={copyText} className="flex items-center hover:text-gray-300">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  <span className="pl-5">{t('copyLink')}</span>
                </button>
              )}
            </li>
            <li className="w-full">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  props.twitterParams.text
                )}&hashtags=${props.twitterParams.hashtags.join(',')}&url=${
                  props.twitterParams.url
                }`}
                className="flex items-center pt-4 hover:text-gray-300"
                target="_blank"
                rel="noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path
                    fill="currentColor"
                    d="M15.3 5.55a2.9 2.9 0 0 0-2.9 2.847l-.028 1.575a.6.6 0 0 1-.68.583l-1.561-.212c-2.054-.28-4.022-1.226-5.91-2.799-.598 3.31.57 5.603 3.383 7.372l1.747 1.098a.6.6 0 0 1 .034.993L7.793 18.17c.947.059 1.846.017 2.592-.131 4.718-.942 7.855-4.492 7.855-10.348 0-.478-1.012-2.141-2.94-2.141zm-4.9 2.81a4.9 4.9 0 0 1 8.385-3.355c.711-.005 1.316.175 2.669-.645-.335 1.64-.5 2.352-1.214 3.331 0 7.642-4.697 11.358-9.463 12.309-3.268.652-8.02-.419-9.382-1.841.694-.054 3.514-.357 5.144-1.55C5.16 15.7-.329 12.47 3.278 3.786c1.693 1.977 3.41 3.323 5.15 4.037 1.158.475 1.442.465 1.973.538z"
                  />
                </svg>
                <span className="pl-5">{t('shareTwitter')}</span>
              </a>
            </li>
          </ul>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
