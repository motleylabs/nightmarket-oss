import type { NextPage, GetStaticPropsContext } from 'next'
import Head from 'next/head'
import {useTranslations} from 'next-intl'


export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      locales: (await import(`./../../locales/${locale}.json`)).default
    }
  };
}

const Home: NextPage = () => {
  const t = useTranslations('Home')

  return (
    <>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </>
  )
}

export default Home
