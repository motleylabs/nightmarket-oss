import { SVGProps } from 'react';

export const SolanaLogo = (props: SVGProps<SVGSVGElement>) => {
  const percent = 0.5; // Half the original size
  const width = 31;
  const height = 27;
  const finalWidth = width * percent;
  const finalHeight = height * percent;
  return (
    <svg viewBox="0 0 31 27" width={finalWidth} height={finalHeight} fill="none" {...props}>
      <path
        d="m30.179 21.3-5.008 5.332a1.143 1.143 0 0 1-.848.368H.583a.59.59 0 0 1-.535-.348.568.568 0 0 1-.04-.328.593.593 0 0 1 .148-.298l5.002-5.332a1.141 1.141 0 0 1 .848-.368h23.74a.574.574 0 0 1 .43.971l.003.003ZM25.17 10.56a1.192 1.192 0 0 0-.848-.368H.583a.59.59 0 0 0-.535.349.569.569 0 0 0-.04.328.59.59 0 0 0 .148.297l5.002 5.335c.107.115.24.208.384.27.147.064.303.095.464.098h23.74a.574.574 0 0 0 .529-.348.569.569 0 0 0-.108-.623l-5-5.335.003-.003ZM.582 6.73h23.74a1.2 1.2 0 0 0 .464-.096c.147-.064.277-.154.384-.272l5.01-5.332a.579.579 0 0 0-.107-.881.571.571 0 0 0-.323-.09H6.006c-.158 0-.317.034-.464.095a1.126 1.126 0 0 0-.384.273L.156 5.759a.582.582 0 0 0-.108.625.59.59 0 0 0 .534.348V6.73Z"
        fill="url(#a)"
      />
      <defs>
        <linearGradient
          id="a"
          x1={2.561}
          y1={27.642}
          x2={27.258}
          y2={-0.397}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.08} stopColor="#9945FF" />
          <stop offset={0.3} stopColor="#8752F3" />
          <stop offset={0.5} stopColor="#5497D5" />
          <stop offset={0.6} stopColor="#43B4CA" />
          <stop offset={0.72} stopColor="#28E0B9" />
          <stop offset={0.97} stopColor="#19FB9B" />
        </linearGradient>
      </defs>
    </svg>
  );
};
