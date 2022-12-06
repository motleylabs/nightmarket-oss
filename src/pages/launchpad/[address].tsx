import Head from 'next/head';
import Icon from '../../components/Icon';
import Link from 'next/link';
import Launchpad, { MintOption } from '../../components/Launchpad';
import { addDays } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'launchpad']);

  return {
    props: {
      ...i18n,
    },
  };
}

export default function LaunchpadPage() {
  const { t } = useTranslation('launchpad');

  return (
    <>
      <main className="relative mx-auto mt-8 flex max-w-7xl flex-wrap justify-start px-4 md:mt-12 md:px-8">
        <Head>
          <title>{'Launchpad test'}</title>
          <meta name="description" content="Launchpad test description"></meta>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="align-self-start mb-10 flex w-full flex-col gap-10 lg:w-1/2">
          <img
            src={'/images/launchpad/motley-launchpad-nft.png'}
            alt={'launchpad image'}
            className="top-10 z-10 w-full rounded-lg object-cover"
          />
        </div>
        <div className="top-20 mb-10 flex w-full flex-col gap-6 pt-0 lg:sticky lg:w-1/2 lg:pl-10">
          <h6 className="font-serif text-2xl font-bold">{t('phaseTitle')}</h6>
          <Launchpad candyMachineId={'9ACm8nAqgzTExSRQpb8JxYnZeEMTgLzsHDpRv8TmQVBY'}>
            {({ onMint, launchpadState, isMinting }) => (
              <>
                {/* TODO: determine how to store finished & upcoming launchpad config states */}
                <Launchpad.Finished
                  onMint={onMint}
                  title={'Founders mint'}
                  price={2.5}
                  minted={25}
                  supply={25}
                  mintType={MintOption.Standard}
                  soldOut={true}
                  soldOutTimeMilliseconds={200000}
                />
                <Launchpad.Active
                  isMinting={isMinting}
                  onMint={onMint}
                  title={'Allowlist mint'}
                  price={launchpadState.price}
                  minted={launchpadState.minted}
                  supply={launchpadState.supply}
                  hasAccess={true}
                  mintType={MintOption.Standard}
                />
                <Launchpad.Upcoming
                  onMint={onMint}
                  title={'Public mint'}
                  price={3}
                  supply={9000}
                  isPublic={true}
                  mintType={MintOption.Dynamic}
                  mintDate={addDays(new Date(), 1)}
                />
              </>
            )}
          </Launchpad>
        </div>
        <div className="align-self-start md-pr-10 mb-10 flex w-full flex-col gap-8 lg:w-1/2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-4">
              <h4 className="text-3xl font-bold">Team Motley</h4>
              <div className="flex flex-row items-center gap-2 text-[#A8A8A8]">
                <Link
                  target="_blank"
                  className="transform ease-in-out hover:scale-105"
                  href="https://twitter.com/holaplex"
                >
                  <Icon.Twitter />
                </Link>
                <Link
                  target="_blank"
                  className="transform ease-in-out hover:scale-105"
                  href="https://discord.gg/holaplex"
                >
                  <Icon.Discord />
                </Link>
              </div>
            </div>
            <p className="text-base text-gray-300">
              This is a test description of a launchpad project for Motley Labs.
            </p>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col rounded-lg bg-gray-800 p-4">
                <p className="text-sm text-gray-300">{t('supply')}</p>
                <h6 className="text-lg font-bold text-white">10,000</h6>
              </div>
              <div className="flex flex-col rounded-lg bg-gray-800 p-4">
                <p className="text-sm text-gray-300">{t('mintDate')}</p>
                <h6 className="text-lg font-bold text-white">10/24/2022</h6>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
