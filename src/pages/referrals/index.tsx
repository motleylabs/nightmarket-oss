import { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ReferralPage from '../../components/ReferralPage';

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'referrals']);

  return {
    props: {
      ...i18n,
    },
  };
}

const Referrals: NextPage = () => {
  return <ReferralPage />;
};

export default Referrals;
