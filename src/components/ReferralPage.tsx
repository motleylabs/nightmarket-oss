import { useWallet } from '@solana/wallet-adapter-react';

import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

import { Steps } from './ReferralSteps';
import { Animation } from './ReferralsAnimation';

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

  const { connected, wallet, disconnecting, publicKey } = useWallet();

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
    let Component = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let nodeRef: any = null;
    switch (steps) {
      case 1: {
        nodeRef = ref1;
        Component = <Steps.Connect setSteps={setSteps} />;
        break;
      }
      case 1.5: {
        nodeRef = ref2;
        Component = (
          <Steps.Welcome setSteps={setSteps} commitName={setName} wallet={publicKey?.toString()} />
        );
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
    <main className="z-0 -mb-[64px] min-h-[calc(100vh_-_120px)] md:-mb-[120px]">
      <Head>
        <title>{`${t('metadata.title', { ns: 'referrals' })} | ${t('header.title', {
          ns: 'common',
        })}`}</title>
        <meta name="description" content={t('metadata.description', { ns: 'referrals' })} />
      </Head>
      <div className="relative min-h-[calc(100vh_-_8px)] overflow-hidden">
        <div className="-z-10 flex justify-center">
          <Animation.Leaves />
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
