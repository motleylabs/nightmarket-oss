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
    <div className="pointer-events-none absolute -bottom-[10%] -left-[40%] w-[200%] md:-left-[10%] md:-bottom-[35%] md:w-[130%]">
      <img src="/images/referrals/leaves.svg" alt="" />
    </div>
  );
}

Animation.Leaves = Leaves;
