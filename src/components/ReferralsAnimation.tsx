import clsx from 'clsx';
import { createRef, CSSProperties, useCallback, useEffect, useState } from 'react';

export function Animation(): JSX.Element {
  return <div></div>;
}

interface LeafsProps {
  steps: number;
}

function Leaves({ steps }: LeafsProps): JSX.Element {
  return (
    <div className="pointer-events-none absolute bottom-0 w-[350vw] sm:w-[200vw] md:w-[150vw] lg:w-[100vw]">
      <img src="/images/referrals/leaves.svg" alt="Background leaves" width={'100%'} />
    </div>
  );
}

Animation.Leaves = Leaves;
