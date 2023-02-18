import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { WalletProfileQuery } from './../../../queries/profile.graphql';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import client from '../../../client';
import { AuctionHouse, Wallet } from '../../../graphql.types';
import ProfileLayout from '../../../layouts/ProfileLayout';
import config from '../../../app.config';
import Button, {
  ButtonBackground,
  ButtonBorder,
  ButtonColor,
  ButtonSize,
} from '../../../components/Button';
import Icon from '../../../components/Icon';
import Link from 'next/link';
import clsx from 'clsx';
import { Table } from '../../../components/Table';
import { useBuddyStats, useClaimBuddy } from '../../../hooks/referrals';
import { QRCodeSVG } from 'qrcode.react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile', 'referrals']);

  const {
    data: { wallet, auctionHouse },
  } = await client.query({
    query: WalletProfileQuery,
    fetchPolicy: 'network-only',
    variables: {
      address: params?.address,
      auctionHouse: config.auctionHouse,
    },
  });

  if (wallet === null || auctionHouse === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      auctionHouse,
      ...i18n,
    },
  };
}

interface ProfileAffiliatePageProps {
  wallet: Wallet;
}

const CLAIM_TAB = 'CLAIM_TAB';
const REFERRED_TAB = 'REFERRED_TAB';
const INACTIVE_TAB = 'INACTIVE_TAB';

export default function ProfileAffiliate({ wallet }: ProfileAffiliatePageProps): JSX.Element {
  const { t } = useTranslation(['referrals', 'common']);
  const [visible, setVisible] = useState(false);
  const [domain, setDomain] = useState('');
  const { onClaimBuddy } = useClaimBuddy();
  const [tab, setTab] = useState(CLAIM_TAB);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { publicKey: adapterWallet, connecting, connected } = useWallet();
  const {
    data: buddy,
    loading: loadingBuddy,
    refreshBuddy,
  } = useBuddyStats({
    wallet: wallet.address,
    organisation: config.buddylink.organizationName,
  });

  //TODO: Values to get from API
  // const [claimedLastWeek] = useState(0);
  // const [volumeLastWeek] = useState(0);
  // const [usersLastWeek] = useState(0);

  const tabContent = useMemo(() => {
    switch (tab) {
      case CLAIM_TAB: {
        return <Table.ClaimHistory wallet={wallet} />;
      }
      case REFERRED_TAB: {
        return <Table.ReferredList referred={buddy?.buddies} loading={loadingBuddy} />;
      }
      case INACTIVE_TAB: {
        return <Table.Inactive />;
      }
    }
  }, [tab]);

  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  const url = useMemo(() => {
    return `${domain}/r/${buddy?.username}`;
  }, [buddy?.username]);

  const handleTabClick = useCallback(
    (newTab: string) => {
      if (newTab !== tab) setTab(newTab);
    },
    [setTab, tab]
  );

  const handleCopy = useCallback(async () => {
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  useEffect(() => {
    if (connected && wallet.address !== adapterWallet?.toString()) {
      router.push(`/profiles/${wallet.address}`);
    }
  }, [wallet.address, adapterWallet?.toString(), connecting, connected]);

  return (
    <>
      <div className="">
        <header className="top-0 grid grid-cols-2 items-center justify-between gap-4 bg-black md:mx-10 md:flex md:h-[58px] xl:my-4 xl:mx-4"></header>
        {!loadingBuddy && !buddy?.publicKey ? (
          <div className="mx-6 mt-10 flex flex-col items-center justify-center xl:mx-0 xl:mt-14 xl:h-[150px] ">
            <div className="mb-4 text-center text-lg text-white sm:w-[375px]">
              {t('noBuddy', { ns: 'referrals' })}
            </div>
            <div className="">
              <Button
                onClick={() => {
                  router.push('/referrals');
                }}
              >
                {t('createLink', { ns: 'referrals' })}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-6 mt-10 flex flex-col items-center justify-center xl:mx-0 xl:mt-14 xl:h-[150px] xl:w-full xl:flex-row">
              <div className="w-full md:flex md:items-center md:justify-center  xl:w-auto">
                {loadingBuddy ? (
                  <>
                    <StatsSkeleton />
                    <StatsSkeleton className="md:mr-0 xl:mr-4" />
                  </>
                ) : (
                  <>
                    <PillStat
                      title={t('profile.available', { ns: 'referrals' })}
                      className="md:mr-4 md:min-w-[328px] xl:mb-0"
                    >
                      <>
                        <div className="flex items-center">
                          <Icon.Solana />
                          <h2 className="ml-1 text-2xl font-bold">{buddy?.totalClaimable}</h2>
                        </div>
                        <div>
                          <Button
                            block
                            className="mt-12 h-8 w-full"
                            background={ButtonBackground.Slate}
                            border={ButtonBorder.Gradient}
                            color={ButtonColor.Gradient}
                            size={ButtonSize.Small}
                            onClick={async () => {
                              if (buddy) {
                                await onClaimBuddy(buddy?.username!);
                                refreshBuddy();
                              }
                            }}
                          >
                            {t('profile.claimRewards', { ns: 'referrals' })}
                          </Button>
                        </div>
                      </>
                    </PillStat>
                    <PillStat
                      title={t('profile.feesByReferral', { ns: 'referrals' })}
                      className="md:min-w-[328px] xl:mb-0 xl:mr-4"
                    >
                      <div className="flex items-center">
                        <Icon.Solana />
                        <h2 className="ml-1 text-2xl font-bold">
                          {(buddy?.totalGeneratedFeeVolumeByReferrals || 0) / 1e9}
                        </h2>
                      </div>
                    </PillStat>
                  </>
                )}
              </div>
              <div className="w-full md:flex md:items-center md:justify-center xl:w-auto">
                {loadingBuddy ? (
                  <>
                    <StatsSkeleton />
                    <StatsSkeleton className="md:mr-0 xl:mr-0" />
                  </>
                ) : (
                  <>
                    <PillStat
                      title={t('profile.allTimeClaim', { ns: 'referrals' })}
                      className="md:mr-4 md:min-w-[328px] xl:mb-0"
                    >
                      <div className="flex items-center">
                        <Icon.Solana />
                        <h2 className="ml-1 text-2xl font-bold">{buddy?.totalEarned}</h2>
                      </div>
                    </PillStat>
                    <PillStat
                      title={t('profile.totalGeneratedRevenue', { ns: 'referrals' })}
                      className="md:min-w-[328px] xl:mb-0 xl:mr-4"
                    >
                      <div className="flex xl:flex-col">
                        <div className="flex w-full items-center">
                          <Icon.Solana />
                          <h2 className="ml-1 text-2xl font-bold">
                            {(buddy?.totalGeneratedMarketplaceVolumeByReferrals || 0) / 1e9}
                          </h2>
                        </div>
                        <div className="flex w-full items-center xl:mt-8">
                          <Icon.User />
                          <h2 className="ml-1 text-2xl font-bold">{buddy?.buddies.length}</h2>
                        </div>
                      </div>
                    </PillStat>
                  </>
                )}
              </div>
              <div className="w-full md:flex md:items-center md:justify-center lg:justify-start xl:w-auto">
                {loadingBuddy ? (
                  <StatsSkeleton half className="lg:w-1/2 xl:ml-4 xl:w-auto" />
                ) : (
                  <div className="h-[180px] rounded-2xl border border-gray-800 p-4 md:min-w-[328px]  lg:w-1/2 xl:w-auto xl:min-w-[259px]">
                    <div className="flex justify-between">
                      <h4 className="text-gray-300">
                        {t('profile.affiliateLink', { ns: 'referrals' })}
                      </h4>
                      <div
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-gray-800 hover:bg-gray-700"
                        onClick={() => {
                          setVisible(true);
                        }}
                      >
                        <Icon.QRCode />
                      </div>
                    </div>
                    <div
                      className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-gray-800"
                      onClick={handleCopy}
                    >
                      {buddy?.username ? (
                        <p className="relative flex items-center bg-gray-800 px-4 text-gray-400">
                          <span>
                            {domain}/r/<span className="text-white">{buddy?.username}</span>
                          </span>
                          <div
                            className="absolute right-2 py-2 pr-2 pl-4"
                            style={{
                              background:
                                'linear-gradient(90deg, rgba(23, 22, 28, 0) 0%, rgb(23, 22, 28, 0.5) 25%, rgb(23, 22, 28) 35%)',
                            }}
                          >
                            {copied ? (
                              <CheckIcon className=" h-4 w-4 text-gray-300" />
                            ) : (
                              <Icon.Copy className=" h-4 w-4" />
                            )}
                          </div>
                        </p>
                      ) : (
                        <p className="flex items-center text-gray-400">
                          {t('profile.generating', { ns: 'referrals' })}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      <Link
                        target="_blank"
                        rel="nofollow noreferrer"
                        className="text-white opacity-50"
                        href={`https://t.me/share/url?url=${url}`}
                      >
                        <Icon.Telegram className="h-4 w-auto" />
                      </Link>
                      <Link
                        target="_blank"
                        rel="nofollow noreferrer"
                        className="mx-4 text-white opacity-50"
                        href={`https://twitter.com/share?url=${url}`}
                      >
                        <Icon.Twitter className="h-5 w-auto" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="xl: mt-11 flex w-full overflow-auto md:pl-6 xl:justify-center xl:pl-0">
              <div className="xl:flex] w-full max-w-[1375px] md:h-[56px] md:min-w-[485px]">
                <Tabs>
                  <Tab
                    label={t('profile.claimHistory', { ns: 'referrals' })}
                    active={tab === CLAIM_TAB}
                    onClick={() => {
                      handleTabClick(CLAIM_TAB);
                    }}
                  />
                  <Tab
                    label={t('profile.referred', { ns: 'referrals' })}
                    active={tab === REFERRED_TAB}
                    onClick={() => {
                      handleTabClick(REFERRED_TAB);
                    }}
                  />
                  {/* <Tab
                    disabled
                    label={t('profile.inactive', { ns: 'referrals' })}
                    active={tab === INACTIVE_TAB}
                    onClick={() => {
                      // handleTabClick(INACTIVE_TAB);
                    }}
                  /> */}
                </Tabs>
              </div>
            </div>
            <div className="flex w-full justify-center md:px-6 xl:px-5">
              <div className="w-full max-w-[1375px]">{tabContent}</div>
            </div>
          </>
        )}
      </div>
      <QRCode
        url={url}
        isVisible={visible}
        close={() => {
          setVisible(false);
        }}
      />
    </>
  );
}

interface ProfileAffiliateLayoutProps {
  children: ReactElement;
  wallet: Wallet;
  auctionHouse: AuctionHouse;
}

ProfileAffiliate.getLayout = function ProfileActivityLayout({
  children,
  wallet,
  auctionHouse,
}: ProfileAffiliateLayoutProps): JSX.Element {
  return (
    <ProfileLayout wallet={wallet} auctionHouse={auctionHouse}>
      {children}
    </ProfileLayout>
  );
};

interface TabsProps {
  children: JSX.Element[];
}

function Tabs({ children }: TabsProps) {
  return (
    <div
      className={clsx(
        'relative mx-0 grid items-center justify-center gap-2 rounded-full px-6 py-1 md:mb-[-75px] md:max-w-xs lg:px-0',
        `grid-cols-${children.length}`
      )}
    >
      {children}
    </div>
  );
}

function Tab(props: { onClick: () => void; label: string; active: boolean; disabled?: boolean }) {
  return (
    <div onClick={props.onClick}>
      <div
        className={clsx(
          'flex h-8  flex-row items-center justify-center rounded-full  font-semibold',
          props.active
            ? 'rounded-full bg-gray-800 text-white'
            : props.disabled
            ? 'cursor-default bg-black text-gray-300'
            : 'cursor-pointer bg-black text-gray-300 hover:bg-gray-800 hover:text-gray-200'
        )}
      >
        {props.label}
      </div>
    </div>
  );
}

function QRCode({ url, isVisible, close }: { url: string; isVisible: boolean; close: () => void }) {
  const { t } = useTranslation(['referrals', 'common']);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen">
      <div className="h-full w-full bg-black opacity-80"></div>
      <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center">
        <div className="relative h-[280px] w-[280px] rounded-3xl bg-gray-800 p-4 md:h-[320px] md:w-[320px] md:p-6 xl:h-[400px] xl:w-[400px] xl:p-8">
          <QRCodeSVG
            height={'100%'}
            width={'100%'}
            value={url}
            fgColor={'white'}
            bgColor={'rgb(23, 22, 28)'}
          />
          <div className="absolute -right-[25px] flex h-[50px] w-[50px] rotate-12 items-center justify-center md:-right-[30px] md:h-[60px] md:w-[60px] xl:-right-[50px] xl:h-[95px] xl:w-[95px]">
            <div className="leading-2 absolute inset-0 m-auto flex items-center justify-center text-center text-xs text-white md:h-[30px] md:w-[30px] md:text-sm md:leading-3 xl:h-[80px] xl:w-[80px] xl:text-xl xl:leading-5">
              {t('share', { ns: 'referrals' })} <br /> {t('and', { ns: 'referrals' })} <br />{' '}
              {t('earn', { ns: 'referrals' })}
            </div>
            <Icon.Stamp className="h-full w-full" />
          </div>
        </div>
        <div
          className=" mt-12 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gray-800"
          onClick={close}
        >
          <Icon.Close />
        </div>
      </div>
    </div>
  );
}

function StatsSkeleton({ className = '', half = false }: { className?: string; half?: boolean }) {
  return (
    <div
      className={clsx(
        'over flex animate-pulse rounded-md transition xl:w-auto',
        half ? 'lg:w-1/2' : 'lg:w-full'
      )}
    >
      <div
        className={clsx(
          'mb-4 h-[180px] w-full rounded-2xl bg-gray-800 p-4 md:mr-4 md:min-w-[328px] lg:w-full xl:mb-0 xl:w-auto  xl:min-w-[259px]',
          className
        )}
      />
    </div>
  );
}

function PillStat({
  className = '',
  title,
  children,
}: {
  className?: string;
  title: string;
  children: JSX.Element;
}) {
  return (
    <div
      className={clsx(
        'mb-4 h-[180px] rounded-2xl bg-gray-800 p-4 md:min-w-[328px] lg:w-full xl:mb-0  xl:w-auto xl:min-w-[259px]',
        className
      )}
    >
      <div className="mb-4 flex items-center md:mb-3">
        <h4 className="leading-6 text-gray-300">{title}</h4>
      </div>
      {children}
    </div>
  );
}
