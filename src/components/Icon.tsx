import React from 'react';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

function CopyIcon({ className, width = 16, height = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`2 1 ${width + 4} ${height + 6}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5M11 9H20C21.1046 9 22 9.89543 22 11V20C22 21.1046 21.1046 22 20 22H11C9.89543 22 9 21.1046 9 20V11C9 9.89543 9.89543 9 11 9Z"
        stroke="#A8A8A8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

Icon.Copy = CopyIcon;

function CurrencyIcon({ className, width = 16, height = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`-1 -1 ${width + 2} ${height + 2}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={width / 2} cy={height / 2} r={height / 2} stroke="#A8A8A8" />
      <circle cx={width / 2} cy={height / 2} r={height / 4} stroke="#A8A8A8" />
    </svg>
  );
}

Icon.Currency = CurrencyIcon;

export default function Icon() {
  return <div></div>;
}

function SolScanIcon({ className, width = 12, height = 12 }: IconProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width={width} height={height} transform="matrix(-1 0 0 1 12 0)" fill="url(#pattern0)" />
      <defs>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#image0_1447_21565" transform="translate(-0.0015873) scale(0.0031746)" />
        </pattern>
        <image
          id="image0_1447_21565"
          width="316"
          height="315"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

Icon.SolScan = SolScanIcon;

function SolIcon({
  className = 'w-4 h-4 mr-2 flex flex-shrink-0',
  noGradient,
}: {
  className?: string;
  noGradient?: boolean;
}) {
  return (
    <svg className={className} viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1084_6329)">
        <path
          d="M2.48681 9.65948C2.5792 9.56708 2.70625 9.51318 2.84099 9.51318H15.0604C15.2837 9.51318 15.3954 9.78267 15.2375 9.94052L12.8237 12.3544C12.7313 12.4468 12.6042 12.5007 12.4695 12.5007H0.25004C0.0267485 12.5007 -0.0848973 12.2312 0.0729468 12.0733L2.48681 9.65948Z"
          fill={noGradient ? 'white' : 'url(#paint0_linear_1084_6329)'}
        ></path>
        <path
          d="M2.48681 0.646295C2.58305 0.553898 2.7101 0.5 2.84099 0.5H15.0604C15.2837 0.5 15.3954 0.76949 15.2375 0.927334L12.8237 3.34119C12.7313 3.43359 12.6042 3.48749 12.4695 3.48749H0.25004C0.0267485 3.48749 -0.0848973 3.218 0.0729468 3.06015L2.48681 0.646295Z"
          fill={noGradient ? 'white' : 'url(#paint1_linear_1084_6329)'}
        ></path>
        <path
          d="M12.8237 5.12286C12.7313 5.03046 12.6042 4.97656 12.4695 4.97656H0.25004C0.0267485 4.97656 -0.0848973 5.24605 0.0729468 5.4039L2.48681 7.81776C2.5792 7.91015 2.70625 7.96405 2.84099 7.96405H15.0604C15.2837 7.96405 15.3954 7.69456 15.2375 7.53672L12.8237 5.12286Z"
          fill={noGradient ? 'white' : 'url(#paint2_linear_1084_6329)'}
        ></path>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_1084_6329"
          x1="13.8931"
          y1="-0.9413"
          x2="5.43631"
          y2="15.2569"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3"></stop>
          <stop offset="1" stopColor="#DC1FFF"></stop>
        </linearGradient>
        <linearGradient
          id="paint1_linear_1084_6329"
          x1="10.1953"
          y1="-2.87253"
          x2="1.73851"
          y2="13.3257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3"></stop>
          <stop offset="1" stopColor="#DC1FFF"></stop>
        </linearGradient>
        <linearGradient
          id="paint2_linear_1084_6329"
          x1="12.0325"
          y1="-1.91421"
          x2="3.57564"
          y2="14.284"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFA3"></stop>
          <stop offset="1" stopColor="#DC1FFF"></stop>
        </linearGradient>
        <clipPath id="clip0_1084_6329">
          <rect width="15.3109" height="12" fill="white" transform="translate(0 0.5)"></rect>
        </clipPath>
      </defs>
    </svg>
  );
}

Icon.Sol = SolIcon;

function TwitterIcon({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      clipRule="evenodd"
      fillRule="evenodd"
      className={className}
      strokeLinejoin="round"
      strokeMiterlimit="2"
      viewBox="-89.00934757 -46.8841404 643.93723344 446.8841404"
    >
      <path
        d="m154.729 400c185.669 0 287.205-153.876 287.205-287.312 0-4.37-.089-8.72-.286-13.052a205.304 205.304 0 0 0 50.352-52.29c-18.087 8.044-37.55 13.458-57.968 15.899 20.841-12.501 36.84-32.278 44.389-55.852a202.42 202.42 0 0 1 -64.098 24.511c-18.42-19.628-44.644-31.904-73.682-31.904-55.744 0-100.948 45.222-100.948 100.965 0 7.925.887 15.631 2.619 23.025-83.895-4.223-158.287-44.405-208.074-105.504a100.739 100.739 0 0 0 -13.668 50.754c0 35.034 17.82 65.961 44.92 84.055a100.172 100.172 0 0 1 -45.716-12.63c-.015.424-.015.837-.015 1.29 0 48.903 34.794 89.734 80.982 98.986a101.036 101.036 0 0 1 -26.617 3.553c-6.493 0-12.821-.639-18.971-1.82 12.851 40.122 50.115 69.319 94.296 70.135-34.549 27.089-78.07 43.224-125.371 43.224a204.9 204.9 0 0 1 -24.078-1.399c44.674 28.645 97.72 45.359 154.734 45.359"
        fill="currentColor"
        fillRule="nonzero"
      />
    </svg>
  );
}

Icon.Twitter = TwitterIcon;

function MediumIcon({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid"
      viewBox="0 0 256 145.39"
    >
      <path
        fill="currentColor"
        d="M72.2 0c39.877 0 72.2 32.549 72.2 72.696 0 40.148-32.326 72.694-72.2 72.694-39.872 0-72.2-32.546-72.2-72.694C0 32.55 32.325 0 72.2 0zm115.3 4.258c19.938 0 36.101 30.638 36.101 68.438h.003c0 37.791-16.163 68.438-36.1 68.438s-36.101-30.647-36.101-68.438c0-37.79 16.16-68.438 36.098-68.438zm55.803 7.129c7.011 0 12.697 27.449 12.697 61.31 0 33.85-5.684 61.31-12.697 61.31s-12.694-27.452-12.694-61.31c0-33.859 5.684-61.31 12.694-61.31z"
      />
    </svg>
  );
}

Icon.Medium = MediumIcon;

function DiscordIcon({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="-10.63 -.07077792 823.87 610.06955549"
    >
      <path
        d="m678.27 51.62c90.35 132.84 134.97 282.68 118.29 455.18-.07.73-.45 1.4-1.05 1.84-68.42 50.24-134.71 80.73-200.07 100.95a2.55 2.55 0 0 1 -2.81-.95c-15.1-21.01-28.82-43.16-40.84-66.42-.69-1.37-.06-3.02 1.36-3.56 21.79-8.21 42.51-18.05 62.44-29.7 1.57-.92 1.67-3.17.22-4.25-4.23-3.14-8.42-6.44-12.43-9.74-.75-.61-1.76-.73-2.61-.32-129.39 59.75-271.13 59.75-402.05 0-.85-.38-1.86-.25-2.59.35-4 3.3-8.2 6.57-12.39 9.71-1.45 1.08-1.33 3.33.25 4.25 19.93 11.43 40.65 21.49 62.41 29.74 1.41.54 2.08 2.15 1.38 3.52-11.76 23.29-25.48 45.44-40.86 66.45-.67.85-1.77 1.24-2.81.92-65.05-20.22-131.34-50.71-199.76-100.95-.57-.44-.98-1.14-1.04-1.87-13.94-149.21 14.47-300.29 118.18-455.18.25-.41.63-.73 1.07-.92 51.03-23.42 105.7-40.65 162.84-50.49 1.04-.16 2.08.32 2.62 1.24 7.06 12.5 15.13 28.53 20.59 41.63 60.23-9.2 121.4-9.2 182.89 0 5.46-12.82 13.25-29.13 20.28-41.63a2.47 2.47 0 0 1 2.62-1.24c57.17 9.87 111.84 27.1 162.83 50.49.45.19.82.51 1.04.95zm-339.04 283.7c.63-44.11-31.53-80.61-71.9-80.61-40.04 0-71.89 36.18-71.89 80.61 0 44.42 32.48 80.6 71.89 80.6 40.05 0 71.9-36.18 71.9-80.6zm265.82 0c.63-44.11-31.53-80.61-71.89-80.61-40.05 0-71.9 36.18-71.9 80.61 0 44.42 32.48 80.6 71.9 80.6 40.36 0 71.89-36.18 71.89-80.6z"
        fill="currentColor"
      />
    </svg>
  );
}

Icon.Discord = DiscordIcon;
