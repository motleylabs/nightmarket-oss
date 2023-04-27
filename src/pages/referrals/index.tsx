import { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import ReferralPage from '../../components/ReferralPage';
import { getCookie } from '../../utils/cookies';
import { COOKIE_REF } from '../_app';

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'referrals']);

  return {
    props: {
      ...i18n,
    },
  };
}

const Referrals: NextPage = () => {
  const [refId, setRefId] = useState('');

  useEffect(() => {
    const referrer = getCookie(COOKIE_REF);
    if (referrer) setRefId(referrer);
  }, []);

  return <ReferralPage referrer={refId} />;
};

export default Referrals;
