import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { Animation } from './ReferralsAnimation';
import { Steps } from './ReferralSteps';

const TOTAL_STEPS = 3;
export default function ReferralPage({ referrer = '' }: { referrer?: string }) {
  const { t } = useTranslation(['referrals', 'common']);
  const [steps, setSteps] = useState(0);
  const [name, setName] = useState('');
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);

  const { connected, wallet, disconnecting } = useWallet();

  useEffect(() => {
    if (!wallet) {
      setSteps(1);
    }

    if (wallet && connected && steps === 0) {
      setSteps(1.5);
    }
  }, [wallet, connected]);

  useEffect(() => {
    if (disconnecting) {
      setSteps(1);
    }
  }, [disconnecting]);

  const step = useMemo(() => {
    let Component = null,
      nodeRef: any = null;
    switch (steps) {
      case 1: {
        nodeRef = ref1;
        Component = <Steps.Connect setSteps={setSteps} />;
        break;
      }
      case 1.5: {
        nodeRef = ref2;
        Component = <Steps.Welcome setSteps={setSteps} commitName={setName} />;
        break;
      }
      case 2: {
        nodeRef = ref3;
        Component = <Steps.Create setSteps={setSteps} commitName={setName} referrer={referrer} />;
        break;
      }
      case 3: {
        nodeRef = ref4;
        Component = <Steps.Success name={name} />;
        break;
      }
      default: {
        nodeRef = ref0;
        Component = <div />;
        break;
      }
    }

    return (
      <SwitchTransition mode={'out-in'}>
        <CSSTransition
          key={steps}
          nodeRef={nodeRef}
          addEndListener={(done: () => void) => {
            nodeRef.current?.addEventListener('transitionend', done, false);
          }}
          classNames="fade"
        >
          <div ref={nodeRef}>{Component}</div>
        </CSSTransition>
      </SwitchTransition>
    );
  }, [steps]);

  return (
    <main className="z-0 h-[calc(100vh_-_120px)]">
      <Head>
        <title>{t('referrals')}</title>
        <meta name="description" content={t('description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative h-[calc(100vh_-_8px)] overflow-hidden">
        <div className="-z-10">
          <Animation.Leaves steps={steps} />
        </div>
        <div className="z-10 flex flex-col items-center pt-20">
          <div className="relative flex h-6 w-60 flex-row justify-between xl:w-80">
            <div className="absolute inset-y-0 my-auto h-0.5 w-full bg-gray-800" />
            <div
              className="absolute inset-y-0 my-auto h-0.5 bg-gradient-hover transition-[width] duration-700"
              style={{ width: `${((steps - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
            {[...Array(TOTAL_STEPS)].map((_, key) => (
              <div
                className={`z-10 flex h-6 w-6 flex-none items-center justify-center rounded-full  bg-gray-800 text-base font-bold text-white ${
                  steps >= key + 1 ? 'bg-gradient-hover' : ''
                }`}
                key={`step-${key}`}
              >
                {key + 1}
              </div>
            ))}
          </div>
          <div className="z-10 px-6 pb-6">{step}</div>
        </div>
      </div>
    </main>
  );
}
