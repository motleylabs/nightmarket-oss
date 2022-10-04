import { cloneElement, ReactElement, ReactNode, useCallback, useMemo, useState } from 'react';
import { Wallet } from '../graphql.types';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { WalletProfileClientQuery } from './../queries/profile.graphql';
import { useTranslation } from 'next-i18next';
import { Overview, SegmentedControl } from './../components/Overview';
import Button, { ButtonSize, ButtonType } from '../components/Button';
import Head from 'next/head';
import Share from '../components/Share';
import config from '../app.config';
import { useQuery } from '@apollo/client';
import { useCurrencies } from '../hooks/currencies';
import clsx from 'clsx';
import Icon from '../components/Icon';
import { shortenAddress } from '../modules/address';
import useClipboard from '../hooks/clipboard';

export interface WalletProfileData {
  wallet: Wallet;
}

export interface WalletProfileVariables {
  address: string;
}

interface ProfileLayout {
  children: ReactElement;
  wallet: Wallet;
}

function ProfileFigure(props: { figure: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium text-gray-300">{props.label}</div>
      <span className="font-semibold">{props.figure}</span>
    </div>
  );
}

function ProfileLayout({ children, wallet }: ProfileLayout): JSX.Element {
  const { t } = useTranslation(['profile', 'common']);
  const address = wallet.address;

  const { copied, copyText } = useClipboard(address);
  const { initialized: currenciesReady, solToUsdString } = useCurrencies();

  const walletProfileClientQuery = useQuery<WalletProfileData, WalletProfileVariables>(
    WalletProfileClientQuery,
    {
      variables: {
        address: address as string,
      },
    }
  );

  const portfolioValue = useMemo(() => {
    const total = walletProfileClientQuery.data?.wallet.collectedCollections.reduce(
      (total, current) => total + Number.parseFloat(current.estimatedValue),
      0
    );

    if (!total) {
      return 0;
    }

    const multiplier = Math.pow(10, 2);
    return Math.round((total * multiplier) / multiplier);
  }, [walletProfileClientQuery.data?.wallet.collectedCollections]);

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
      <section className="flex flex-col gap-8 pt-20">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row  md:gap-6">
          <Overview.Avatar src={wallet.previewImage as string} circle />
          <div className="flex flex-col items-center gap-6 md:items-start">
            <h1 className=" text-center text-3xl font-semibold text-white md:text-left md:text-4xl">
              {wallet.displayName}
            </h1>
            <div className="flex items-center gap-4 text-gray-300  md:items-center">
              {/* <Overview.Figure figure={wallet.compactCreatedCount} label={'Created'} />
              <Overview.Figure figure={wallet.compactOwnedCount} label={'Collected'} /> */}
              <div
                onClick={copyText}
                className="group flex cursor-pointer gap-1 text-sm  font-medium"
              >
                {shortenAddress(wallet.address)}
                <button className="ml-auto flex cursor-pointer items-center">
                  {copied ? <CheckIcon className="h-3 w-3 " /> : <Icon.Copy className="h-3 w-3" />}
                </button>
              </div>

              <a
                href={'https://twitter.com/' + wallet.displayName}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex cursor-pointer items-center gap-1 rounded-full text-sm">
                  {wallet.displayName}
                  {/* <Icon.Twitter className="h-4 w-4" /> */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      fill="currentColor"
                      d="M15.3 5.55a2.9 2.9 0 0 0-2.9 2.847l-.028 1.575a.6.6 0 0 1-.68.583l-1.561-.212c-2.054-.28-4.022-1.226-5.91-2.799-.598 3.31.57 5.603 3.383 7.372l1.747 1.098a.6.6 0 0 1 .034.993L7.793 18.17c.947.059 1.846.017 2.592-.131 4.718-.942 7.855-4.492 7.855-10.348 0-.478-1.012-2.141-2.94-2.141zm-4.9 2.81a4.9 4.9 0 0 1 8.385-3.355c.711-.005 1.316.175 2.669-.645-.335 1.64-.5 2.352-1.214 3.331 0 7.642-4.697 11.358-9.463 12.309-3.268.652-8.02-.419-9.382-1.841.694-.054 3.514-.357 5.144-1.55C5.16 15.7-.329 12.47 3.278 3.786c1.693 1.977 3.41 3.323 5.15 4.037 1.158.475 1.442.465 1.973.538z"
                    />
                  </svg>
                </div>
              </a>
              {/* <Overview.Figure figure={wallet.compactFollowerCount} label={'Followers'} /> */}
              {/* <Overview.Figure figure={wallet.compactFollowingCount} label={'Following'} />  */}

              <Overview.Actions>
                {/* <Button>Follow</Button> */}
                <Share
                  address={address}
                  twitterParams={{
                    text: t('twitterShareText'),
                    hashtags: ['nightmarket'],
                    url: `${config.baseUrl}/profiles/${address}`,
                  }}
                />
              </Overview.Actions>
            </div>
          </div>
        </div>

        <div className="mx-6 mb-10 grid grid-cols-2  justify-center gap-10 rounded-lg bg-gray-800 py-4 px-6 text-white md:mx-auto md:mb-16 md:grid-cols-4 ">
          <ProfileFigure
            figure={(currenciesReady && portfolioValue && solToUsdString(portfolioValue)) || '0'}
            label="Net Worth"
          />
          <ProfileFigure figure="79" label="Total NFTs" />
          <ProfileFigure figure="23" label="Listed NFTs" />
          {/* <ProfileFigure figure="56" label="Unlisted NFTs" /> */}
          <ProfileFigure
            figure={
              <div className="flex items-center gap-2">
                <svg
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.7414 8.09734C15.7414 12.1876 12.4395 15.5 8.3707 15.5C4.30188 15.5 1 12.1876 1 8.09734C1 4.00704 4.30188 0.694656 8.3707 0.694656C12.4395 0.694656 15.7414 4.00704 15.7414 8.09734Z"
                    fill="#17161C"
                    stroke="url(#paint0_linear_38_3655)"
                  />
                  <path
                    d="M15.9927 7.63657L15.9927 7.63652C15.8201 3.88408 12.8271 0.799941 9.07484 0.518842L9.07482 0.51884C7.0522 0.367221 5.22486 1.14666 3.79788 2.3949C3.98111 2.38629 4.16574 2.38198 4.35164 2.38198C6.33168 2.38198 8.17516 2.87843 9.68643 3.84803C9.9647 3.50397 10.1749 3.11324 10.2933 2.70449L10.2934 2.704C10.4713 2.09216 11.3358 2.09216 11.5137 2.704L11.5138 2.70438C11.8223 3.76826 12.7413 4.68623 13.808 4.99437L13.8088 4.99462C14.4179 5.17176 14.4251 6.03759 13.8071 6.21488M15.9927 7.63657L13.6692 5.73426M15.9927 7.63657C16.1013 9.99338 14.9783 12.1478 13.29 13.6042M15.9927 7.63657L13.29 13.6042M13.8071 6.21488L13.6692 5.73426M13.8071 6.21488C13.8074 6.21478 13.8078 6.21468 13.8081 6.21458L13.6692 5.73426M13.8071 6.21488C13.3338 6.35194 12.8854 6.61098 12.5055 6.95505M13.6692 5.73426C13.6417 5.74221 13.6143 5.7505 13.587 5.75914L13.5304 5.95508C13.4454 5.93053 13.3613 5.90311 13.278 5.87296C12.7535 6.09392 12.2761 6.43949 11.8886 6.86488M12.5055 6.95505C12.4472 6.84115 12.3867 6.72915 12.3238 6.61906L11.9254 6.84654L11.8886 6.86488M12.5055 6.95505C13.1489 8.21395 13.5057 9.70503 13.5057 11.4047C13.5057 12.1825 13.4316 12.9162 13.29 13.6042M12.5055 6.95505L13.29 13.6042M11.8886 6.86488L11.8904 6.86654L11.8896 6.86698L11.8886 6.86488ZM2.52789 2.96673C2.51859 2.9775 2.50932 2.98828 2.50007 2.99908M2.52789 2.96673L2.52798 2.96663C2.60831 2.87362 2.69051 2.78197 2.77454 2.69182C2.81097 2.72495 2.84502 2.76572 2.87294 2.81492C2.90357 2.86891 2.92116 2.92307 2.93016 2.97321C2.79876 2.99046 2.66839 3.01014 2.53909 3.03224M2.52789 2.96673L2.53909 3.03224M2.52789 2.96673L2.53909 3.03224M2.50007 2.99908C2.46015 3.04576 2.43762 3.06096 2.43806 3.06165C2.43855 3.06244 2.46934 3.04408 2.53885 3.03228L2.50007 2.99908ZM2.50007 2.99908L2.53888 3.03227C2.53895 3.03226 2.53902 3.03225 2.53909 3.03224M13.3525 5.36662C13.3953 5.31606 13.4545 5.2759 13.5303 5.25395C13.4452 5.27856 13.361 5.30601 13.2779 5.33617C13.3027 5.3466 13.3275 5.35675 13.3525 5.36662ZM3.2295 2.9383C3.59649 2.90083 3.97093 2.88198 4.35164 2.88198C6.40698 2.88198 8.28545 3.43993 9.76417 4.5054C10.1343 4.14079 10.4356 3.70608 10.6351 3.23338C10.6051 3.15076 10.5778 3.06722 10.5534 2.98288L10.7484 2.92631C10.7571 2.89885 10.7655 2.87128 10.7735 2.84363C10.8117 2.71228 10.9954 2.71228 11.0336 2.84363C11.0416 2.87126 11.05 2.8988 11.0587 2.92624L11.2538 2.98276C11.2537 2.98293 11.2537 2.98309 11.2536 2.98325L11.0588 2.92658C11.0837 3.00506 11.1114 3.08275 11.1418 3.15949C11.1916 3.1171 11.2312 3.05897 11.2531 2.9851C11.2288 3.06879 11.2017 3.15159 11.172 3.23341L3.2295 2.9383ZM10.6653 3.1595C10.6957 3.08276 10.7235 3.00507 10.7484 2.92658L10.5535 2.98325C10.5752 3.05801 10.6151 3.11676 10.6653 3.1595ZM13.5864 5.75933L13.5296 5.95483C13.4551 5.93316 13.3963 5.89293 13.3535 5.84214L13.5864 5.75933Z"
                    fill="url(#paint1_linear_38_3655)"
                    stroke="url(#paint2_linear_38_3655)"
                  />
                  <path
                    d="M11.2757 6.81777C11.1377 6.99696 11.0127 7.18678 10.9033 7.38529C10.4952 6.64351 9.86574 6.01436 9.12339 5.60597C9.35913 5.47616 9.58273 5.32445 9.79097 5.15478C10.3663 5.6208 10.8668 6.17628 11.2757 6.81777Z"
                    fill="url(#paint3_linear_38_3655)"
                    stroke="url(#paint4_linear_38_3655)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_38_3655"
                      x1="1.80274"
                      y1="0.194656"
                      x2="16.3573"
                      y2="6.78207"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F85C04" />
                      <stop offset="1" stopColor="#EC9D08" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_38_3655"
                      x1="3.60179"
                      y1="-8.86761e-08"
                      x2="16.8115"
                      y2="5.69517"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F85C04" />
                      <stop offset="1" stopColor="#EC9D08" />
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear_38_3655"
                      x1="3.60179"
                      y1="-8.86761e-08"
                      x2="16.8115"
                      y2="5.69517"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F85C04" />
                      <stop offset="1" stopColor="#EC9D08" />
                    </linearGradient>
                    <linearGradient
                      id="paint3_linear_38_3655"
                      x1="8.35756"
                      y1="4.50641"
                      x2="11.9447"
                      y2="6.09189"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F85C04" />
                      <stop offset="1" stopColor="#EC9D08" />
                    </linearGradient>
                    <linearGradient
                      id="paint4_linear_38_3655"
                      x1="8.35756"
                      y1="4.50641"
                      x2="11.9447"
                      y2="6.09189"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F85C04" />
                      <stop offset="1" stopColor="#EC9D08" />
                    </linearGradient>
                  </defs>
                </svg>
                824
              </div>
            }
            label="Unlisted NFTs"
          />
        </div>
      </section>
      {/* <SegmentedControl /> */}
      <Overview.Tabs2>
        <Overview.Tab href={`/profiles/${address}/collected`}>{t('collected')}</Overview.Tab>
        {/* <Overview.Tab href={`/profiles/${address}/created`}>{t('created')}</Overview.Tab> */}
        <Overview.Tab href={`/profiles/${address}/activity`}>{t('activity')}</Overview.Tab>
        {/* <Overview.Tab href={`/profiles/${address}/analytics`}>{t('analytics')}</Overview.Tab> */}
      </Overview.Tabs2>
      {/* <Overview.Tab href={`/profiles/${address}/created`}>{t('created')}</Overview.Tab> */}
      {/* <Overview.Tabs>
        <Overview.Tab href={`/profiles/${address}/collected`}>{t('collected')}</Overview.Tab>
        <Overview.Tab href={`/profiles/${address}/activity`}>{t('activity')}</Overview.Tab>
        <Overview.Tab href={`/profiles/${address}/analytics`}>{t('analytics')}</Overview.Tab>
      </Overview.Tabs> */}
      {/* <Overview.Divider /> */}
      {cloneElement(children, { walletProfileClientQuery })}
    </>
  );
}

export default ProfileLayout;
