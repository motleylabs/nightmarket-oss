import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { WalletProfileQuery } from './../../../queries/profile.graphql';
import { ReactElement, useCallback, useState } from 'react';
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
import { useBuddy, useClaimBuddy } from '../../../hooks/referrals';
import { Collection } from '../../../components/Collection';
import { QRCodeSVG } from 'qrcode.react';

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

interface ProfileAffiliatePageProps {}

const CLAIM_TAB = 'CLAIM_TAB';
const REFERRED_TAB = 'REFERRED_TAB';
const INACTIVE_TAB = 'INACTIVE_TAB';

export default function ProfileAffiliate({}: ProfileAffiliatePageProps): JSX.Element {
  const { t } = useTranslation(['referrals', 'common']);
  const [visible, setVisible] = useState(false);
  const { loadingBuddy, buddy, balance, chest, refreshBalance } = useBuddy();
  const { onClaimBuddy } = useClaimBuddy();
  const [tab, setTab] = useState(CLAIM_TAB);
  // const metadata = {
  //   data: [
  //     { Address: 'Wutm...Tiol', Date: '24.12.22' },
  //     { Address: 'Wutm...Tiol', Date: '24.12.22' },
  //   ],
  //   columns: [{ label: 'Address' }, { label: 'Date' }],
  // };
  const metadata = {
    data: [],
    columns: [],
  };

  const handleTabClick = useCallback(
    (newTab: string) => {
      if (newTab !== tab) setTab(newTab);
    },
    [setTab, tab]
  );

  return (
    <>
      <div className="">
        <header className="top-0 my-4 mx-4 grid h-[58px] grid-cols-2 items-center justify-between gap-4 bg-black md:mx-10 md:flex"></header>
        <div className="mt-14 flex h-[150px] w-full justify-center">
          <div className="mr-4 h-full min-w-[328px] rounded-2xl bg-gray-800 p-4">
            <div className="flex h-8 items-center justify-between">
              <h4 className="font-semibold text-gray-300">{t('profile.available')}</h4>
              <Button
                className="ml-4 h-8 w-full md:w-auto"
                block
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
                size={ButtonSize.Small}
                onClick={async () => {
                  if (buddy) {
                    await onClaimBuddy(buddy?.name);
                    refreshBalance();
                  }
                }}
              >
                {t('profile.claimRewards')}
              </Button>
            </div>
            <div className="mt-5 flex items-center">
              <Icon.Solana />
              <h2 className="ml-1 text-2xl font-bold">{balance}</h2>
            </div>
          </div>
          <div className="mr-4 h-full min-w-[328px] rounded-2xl bg-gray-800 p-4">
            <div className="flex h-8 items-center ">
              <h4 className="text-gray-300">{t('profile.allTimeClaim')}</h4>
            </div>
            <div className="mt-4 flex items-center">
              <Icon.Solana />
              <h2 className="ml-1 text-2xl font-bold">{chest?.totalEarned?.toNumber()}</h2>
            </div>
          </div>
          <div className="mr-4 h-full min-w-[328px] rounded-2xl bg-gray-800 p-4">
            <div className="flex h-8 items-center ">
              <h4 className="text-gray-300">{t('profile.totalGeneratedRevenue')}</h4>
            </div>
            <div className="flex">
              <div className="mt-4 flex w-full items-center">
                <Icon.Solana />
                <h2 className="ml-1 text-2xl font-bold">0{/* need info from motley */}</h2>
              </div>
              <div className="mt-4 flex w-full items-center">
                <Icon.User />
                <h2 className="ml-1 text-2xl font-bold">
                  {buddy?.numberOfReferredUsers.toNumber()}
                </h2>
              </div>
            </div>
          </div>
          <div className="h-full min-w-[328px] rounded-2xl border border-gray-800 p-4">
            <div className="flex justify-between">
              <h4 className="font-semibold text-gray-300">{t('profile.affiliateLink')}</h4>
              <div
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded bg-gray-800 hover:bg-gray-700"
                onClick={() => {
                  setVisible(true);
                }}
              >
                <Icon.QRCode />
              </div>
            </div>
            <div className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-gray-800">
              <p className="flex items-center text-gray-400">
                {config.baseUrl}/r/<span className="text-white">{buddy?.name}</span>
                <Icon.Copy className="ml-2 h-4 w-4" />
              </p>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <Link
                target="_blank"
                rel="nofollow noreferrer"
                className="text-white opacity-50"
                href={''}
              >
                <Icon.Telegram className="h-4 w-auto" />
              </Link>
              <Link
                target="_blank"
                rel="nofollow noreferrer"
                className="mx-4 text-white opacity-50"
                href={''}
              >
                <Icon.Twitter className="h-5 w-auto" />
              </Link>
              <Link
                target="_blank"
                rel="nofollow noreferrer"
                className="text-white opacity-50"
                href={''}
              >
                <Icon.Discord className="h-5 w-auto" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-11 flex w-full justify-center pl-12">
          <div className="h-[56px] w-full max-w-[1500px]">
            <Tabs>
              <Tab
                label={t('profile.claimHistory')}
                active={tab === CLAIM_TAB}
                onClick={() => {
                  handleTabClick(CLAIM_TAB);
                }}
              />
              <Tab
                label={t('profile.referred')}
                active={tab === REFERRED_TAB}
                onClick={() => {
                  handleTabClick(REFERRED_TAB);
                }}
              />
              <Tab
                label={t('profile.inactive')}
                active={tab === INACTIVE_TAB}
                onClick={() => {
                  handleTabClick(INACTIVE_TAB);
                }}
              />
            </Tabs>
          </div>
        </div>
        <div className="mt-11 flex w-full justify-center pl-12">
          <div className="w-full max-w-[1500px]">
            {loadingBuddy ? (
              <>
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
              </>
            ) : (
              <Table metadata={metadata} />
            )}
          </div>
        </div>
      </div>
      <QRCode
        url={`${config.baseUrl}/r/${buddy?.name}`}
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
        'relative mx-4 grid items-center justify-center gap-2 rounded-full px-1 py-1 md:mb-[-75px] md:max-w-md',
        `grid-cols-${children.length}`
      )}
    >
      {children}
    </div>
  );
}

function Tab(props: { onClick: () => void; label: string; active: boolean }) {
  return (
    <div onClick={props.onClick}>
      <div
        className={clsx(
          'flex h-12  flex-row items-center justify-center rounded-full  font-semibold',
          props.active
            ? 'rounded-full bg-gray-800 text-white'
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
        <div className="relative h-[400px] w-[400px] rounded-3xl bg-gray-800 p-8">
          <QRCodeSVG
            height={'100%'}
            width={'100%'}
            value={url}
            fgColor={'white'}
            bgColor={'rgb(23, 22, 28)'}
          />

          <div className="absolute -right-[50px] flex h-[95px] w-[95px] rotate-12 items-center justify-center">
            <div className="absolute inset-0 m-auto flex h-[80px] w-[80px] items-center justify-center text-center text-xl leading-5 text-white">
              {t('share')} <br /> {t('and')} <br /> {t('earn')}
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
