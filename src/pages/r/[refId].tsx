import { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

import ReferralPage from '../../components/ReferralPage';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'referrals']);

  return {
    props: {
      ...i18n,
    },
  };
}

const Referrals: NextPage = () => {
  const router = useRouter();

  const { refId } = router.query;

  return <ReferralPage referrer={refId as string} />;
};

export default Referrals;
