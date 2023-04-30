import { GetServerSidePropsContext, NextPage } from 'next';

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  const { refId } = params!;
  const query = `ref=${refId}`;

  return {
    redirect: {
      destination: `/?${query}`,
      permanent: false,
    },
  };
}

const Referrals: NextPage = () => {
  return null;
};

export default Referrals;
