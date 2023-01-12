import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Button, { ButtonBackground } from './Button';

export default function Banner() {
  const { t } = useTranslation('referrals');
  const router = useRouter();

  return (
    <div className="mt-14 w-full rounded-2xl bg-gradient-primary">
      <div className="p-6 md:p-11 lg:flex lg:flex-row-reverse lg:justify-between">
        <div className="faded-gradient-text md:flex md:flex-col md:items-center lg:ml-12 lg:w-full lg:justify-center">
          <div className="-mt-4 pt-4">
            <div className="text-xl font-semibold md:text-2xl xl:text-2xl">{t('banner.upTo')}</div>
            <div className="text-[92px] font-bold leading-[76px] md:text-[164px] md:leading-[140px] xl:text-[140px]">
              100%
            </div>
            {/* <div className="text-xl font-bold md:text-2xl  xl:text-2xl">
              {t('banner.transactionFees')}
            </div> */}
          </div>
        </div>
        <div className="mt-8 md:mt-16 md:flex lg:mt-0 lg:block xl:max-w-[456px]">
          <div className="md:w-2/3 lg:w-auto">
            <div className="w-[265px] text-2xl font-bold leading-[32px] text-white md:w-auto md:text-[32px] md:font-normal md:leading-[40px]">
              {t('banner.joinAffiliate')}
            </div>
            <div className="mt-2 w-[265px] text-sm font-semibold text-white opacity-60 md:w-auto md:pr-6 md:text-base">
              {t('banner.instruction')}
            </div>
          </div>
          <div className="lg:auto mt-6 md:mt-0 md:flex md:w-1/3 md:items-end md:justify-center lg:mt-7 lg:w-auto lg:justify-start">
            <Button
              background={ButtonBackground.Black}
              onClick={() => {
                router.push('/referrals');
              }}
            >
              {t('banner.createReferral')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
