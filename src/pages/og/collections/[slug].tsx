import { GetServerSidePropsContext } from 'next';

import { api } from '../../../infrastructure/api';
import { Collection } from '../../../typings';

export async function getServerSideProps({ params, res }: GetServerSidePropsContext) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate');

  try {
    const { data } = await api.get<Collection>(`/collections/${params?.slug}`);

    if (data === null) {
      return {
        notFound: true,
      };
    }

    return {
      redirect: {
        destination:
          `/api/og?name=${data.name}&image=${encodeURIComponent(data.image)}&owners=${
            data.statistics.holders
          }` +
          `&volume=${data.statistics.volume1d}&floor=${data.statistics.floor1d}&listed=${data.statistics.listed1d}&verified=${data.isVerified}`,
      },
    };
  } catch (e) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
}

const OGCollection: React.FC = () => <div></div>;

export default OGCollection;
