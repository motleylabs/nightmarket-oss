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
          <div>
            <div className="text-xl font-bold md:text-2xl  xl:text-2xl">{t('banner.upTo')}</div>
            <div className="-mt-9 text-[92px] font-bold  md:-mt-[3.5rem] md:text-[140px] xl:text-[140px]">
              100%
            </div>
          </div>
        </div>
        <div className="-mt-2 md:mt-8 md:flex lg:mt-0 lg:block xl:max-w-[456px]">
          <div className="md:w-2/3 lg:w-auto">
            <div className="text-2xl font-bold text-white md:text-[32px] md:font-semibold">
              {t('banner.joinAffiliate')}
            </div>
            <div className="mt-2 text-sm font-semibold text-white opacity-60 md:text-base">
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
