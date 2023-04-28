import { CheckIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@solana/wallet-adapter-react';

import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import useLogin from '../hooks/login';
import { useBuddy, useCreateBuddy } from '../hooks/referrals';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './Button';
import Icon from './Icon';

export function Steps(): JSX.Element {
  return <div></div>;
}

interface ConnectProps {
  setSteps: Dispatch<SetStateAction<number>>;
}

function Connect({ setSteps }: ConnectProps): JSX.Element {
  const { t } = useTranslation('referrals');
  const onLogin = useLogin();
  const { connected } = useWallet();

  useEffect(() => {
    if (connected) {
      setSteps(1.5);
    }
  }, [connected]);

  return (
    <div className="mt-12 flex flex-col items-center" style={{ maxWidth: 520 }}>
      <div className="text-center text-2xl font-bold text-white  md:text-3xl">
        {t('generateLink', { ns: 'referrals' })}
      </div>

      <Button onClick={onLogin} className="mt-10 inline-block  font-semibold">
        {t('connectWallet', { ns: 'referrals' })}
      </Button>
    </div>
  );
}

Steps.Connect = Connect;

interface WelcomeProps {
  setSteps: Dispatch<SetStateAction<number>>;
  commitName: Dispatch<SetStateAction<string>>;
  wallet?: string;
}

function Welcome({ setSteps, commitName, wallet }: WelcomeProps): JSX.Element {
  const { t } = useTranslation('referrals');
  const [timeEllapsed, setTimeEllapsed] = useState(false);

  const { loading: loadingBuddy, data: buddy } = useBuddy(wallet);

  useEffect(() => {
    if (timeEllapsed && !loadingBuddy && !buddy?.publicKey) {
      setSteps(2);
    } else if (timeEllapsed && !loadingBuddy && buddy?.publicKey) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
      commitName(buddy?.username!);
      setSteps(3);
    }
  }, [timeEllapsed, loadingBuddy, buddy]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeEllapsed(true);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="mt-12 flex flex-col items-center" style={{ maxWidth: 320 }}>
      <div className="text-center text-2xl font-bold text-white  md:text-3xl">
        {t('welcomeMarket', { ns: 'referrals' })}
      </div>
    </div>
  );
}

Steps.Welcome = Welcome;

interface CreateProps {
  setSteps: Dispatch<SetStateAction<number>>;
  commitName: Dispatch<SetStateAction<string>>;
  referrer: string;
}

const FEE_ESTIMATE = 0.007;

function Create({ setSteps, commitName, referrer }: CreateProps): JSX.Element {
  const { t } = useTranslation('referrals');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [domain, setDomain] = useState('');
  const { publicKey } = useWallet();

  const { creating, created, onCreateBuddy, validateName } = useCreateBuddy();

  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  useEffect(() => {
    if (created) setSteps(3);
  }, [created]);

  useEffect(() => {
    let shouldUpdate = true;
    if (name.length >= 3) {
      validateName(name.toLowerCase()).then((isAvailable) => {
        if (!shouldUpdate) return null;
        if (!isAvailable) {
          setError(t('usernameTaken'));
        } else if (isAvailable && error) {
          setError('');
        }
      });
    }

    return () => {
      shouldUpdate = false;
    };
  }, [name]);

  const handleEnter = useCallback(async () => {
    if (!error) {
      if (name.length >= 3) {
        await onCreateBuddy(name, referrer);
        commitName(name.toLowerCase());
      } else setError(t('nameLengthError'));
    }
  }, [name, error]);

  return (
    <div className="mt-12 flex flex-col items-center" style={{ maxWidth: 420 }}>
      <div className="text-center text-2xl font-bold text-white  md:text-3xl">
        {t('createUnique')}
      </div>
      <div
        className={clsx(
          'mt-10 flex h-12 w-full flex-row items-center rounded-lg border border-neutral-600 py-2 px-4',
          {
            'border-red-500': error,
          }
        )}
      >
        <input
          autoFocus
          className={'h-12 w-full bg-transparent text-white placeholder:text-gray-500'}
          placeholder={t('placeholder')}
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-Z0-9]*$/.test(value)) {
              setName(value);
              setError('');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEnter();
          }}
        />
        {publicKey && (
          <div className="flex h-full items-center rounded bg-gray-800 p-2 text-sm font-semibold text-gray-200">
            {publicKey.toBase58()}
          </div>
        )}
      </div>

      <div className="mt-1 ml-4 w-full text-sm">
        {error ? (
          <p className="whitespace-nowrap text-left text-sm text-red-500">{error}</p>
        ) : (
          <>
            <span className="text-gray-500">{`${domain}/r/`}</span>
            <span className="text-white">{name ? name.toLowerCase() : '...'}</span>
          </>
        )}
      </div>
      <div className="mt-8 flex flex-col justify-center">
        <div className="flex flex-none justify-center">
          {creating ? (
            <Button background={ButtonBackground.Slate} className="flex flex-1">
              <div className="flex flex-1">
                {t('creating')}
                <Icon.Loading className="flex-0 ml-2 h-6 w-6 animate-spin ease-in-out" />
              </div>
            </Button>
          ) : (
            <Button disabled={!!error} onClick={handleEnter}>
              {t('createLink')}
            </Button>
          )}
        </div>
        <div className="mt-2 text-sm">
          <span className="text-gray-500"> {t('fee')}</span>{' '}
          <span className="text-white">~{FEE_ESTIMATE} SOL</span>
        </div>
      </div>
    </div>
  );
}

Steps.Create = Create;

interface SuccessProps {
  name: string;
}

function Success({ name }: SuccessProps): JSX.Element {
  const { t } = useTranslation('referrals');
  const [domain, setDomain] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  const url = useMemo(() => {
    return `${domain}/r/${name}`;
  }, [name]);

  const copyWallet = useCallback(async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const { publicKey } = useWallet();

  return (
    <div className="mt-12 flex flex-col items-center" style={{ maxWidth: 420 }}>
      <div className="text-center  text-2xl font-bold text-white md:text-3xl">
        {t('successCreate', { ns: 'referrals' })}
      </div>
      <div className="mt-8 h-36 w-36  [&>svg]:h-36 [&>svg]:w-36">
        {url ? <QRCodeSVG value={url} fgColor={'white'} bgColor={'black'} /> : null}
      </div>
      <div className="mt-8 flex w-full flex-row items-center justify-center font-medium">
        <div className="pr-4 ">
          <span className="text-gray-500">{`${domain}/r/`}</span>
          <span className="text-white">{name}</span>
        </div>
        <button
          type="button"
          onClick={copyWallet}
          className="flex cursor-pointer items-center text-base text-white duration-200 ease-in-out hover:scale-110 "
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-gray-300" />
          ) : (
            <Icon.Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="relative w-full">
        <div className="absolute -top-24 right-4 flex h-14 w-14 rotate-12 items-center justify-center md:-top-5 xl:right-0">
          <div
            className="absolute inset-0 m-auto h-10 w-10 text-center leading-3 text-white"
            style={{ paddingTop: 2, fontSize: 10 }}
          >
            {t('share', { ns: 'referrals' })} <br /> {t('and', { ns: 'referrals' })} <br />{' '}
            {t('earn', { ns: 'referrals' })}
          </div>
          <Icon.Stamp className="h-14" />
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center">
        <Link
          target="_blank"
          rel="nofollow noreferrer"
          className="text-white"
          href={`https://t.me/share/url?url=${url}`}
        >
          <Icon.Telegram />
        </Link>
        <Link
          target="_blank"
          rel="nofollow noreferrer"
          className="mx-4 text-white"
          href={`https://twitter.com/share?url=${url}`}
        >
          <Icon.Twitter />
        </Link>
      </div>
      <div className="mt-5 text-white xl:font-semibold">{t('manage', { ns: 'referrals' })}</div>
      <Link href={`/profiles/${publicKey}/affiliate`}>
        <Button
          className="mt-6 w-32 text-sm sm:w-auto xl:mt-3"
          block
          background={ButtonBackground.Black}
          border={ButtonBorder.Gradient}
          color={ButtonColor.Gradient}
        >
          {t('goTo', { ns: 'referrals' })}
        </Button>
      </Link>
    </div>
  );
}

Steps.Success = Success;
