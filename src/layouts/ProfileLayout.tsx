import { ReactElement } from 'react';
import { Wallet } from '../types';
import { PlusIcon, DownloadIcon, RefreshIcon } from '@heroicons/react/outline';
import { useTranslation } from 'next-i18next';
import { Overview } from './../components/Overview';
import Button, { ButtonSize, ButtonType } from '../components/Button';
import Head from 'next/head';

interface ProfileLayout {
  children: ReactElement;
  wallet: Wallet;
}

function ProfileLayout({ children, wallet }: ProfileLayout): JSX.Element {
  const { t } = useTranslation(['profile', 'common']);

  const address = wallet.address;

  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: wallet.displayName })}</title>
        <meta
          name="description"
          content={t('metadata.description', { name: wallet.displayName })}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview>
        <Overview.Hero>
          <Overview.Info
            avatar={<Overview.Avatar src={wallet.previewImage} circle />}
            title={<Overview.Title>{wallet.displayName}</Overview.Title>}
          >
            <Overview.Actions>
              <Button icon={<PlusIcon width={14} height={14} />} size={ButtonSize.Small}>
                {t('follow', { ns: 'common' })}
              </Button>
              <Button
                circle
                icon={<DownloadIcon width={14} height={14} />}
                size={ButtonSize.Small}
                type={ButtonType.Secondary}
              />
            </Overview.Actions>
            <Overview.Figures>
              <Overview.Figure figure={wallet.compactFollowerCount} label={t('followers')} />
              <Overview.Figure figure={wallet.compactFollowingCount} label={t('following')} />
            </Overview.Figures>
          </Overview.Info>
          <Overview.Aside>
            <div className="flex flex-col gap-4 md:gap-6 xl:gap-4">
              <span className="text-gray-300">{t('portfolioValue')}</span>
              <span className="text-xl md:text-lg lg:text-xl">$99,217.48</span>
              <span>{wallet.portfolioValue} SOL</span>
            </div>
            <div className="flex flex-col justify-between">
              <Button
                circle
                icon={<RefreshIcon width={14} height={14} className="stroke-gray-300" />}
                size={ButtonSize.Small}
                type={ButtonType.Secondary}
              />
            </div>
          </Overview.Aside>
        </Overview.Hero>
        <Overview.Tabs>
          <Overview.Tab href={`/profiles/${address}/collected`}>{t('collected')}</Overview.Tab>
          <Overview.Tab href={`/profiles/${address}/created`}>{t('created')}</Overview.Tab>
          <Overview.Tab href={`/profiles/${address}/activity`}>{t('activity')}</Overview.Tab>
          <Overview.Tab href={`/profiles/${address}/analytics`}>{t('analytics')}</Overview.Tab>
        </Overview.Tabs>
        <Overview.Divider />
        {children}
      </Overview>
    </>
  );
}

export default ProfileLayout;
