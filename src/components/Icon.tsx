import React from 'react';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

function CopyIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox={`0 0 24 24`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5M11 9H20C21.1046 9 22 9.89543 22 11V20C22 21.1046 21.1046 22 20 22H11C9.89543 22 9 21.1046 9 20V11C9 9.89543 9.89543 9 11 9Z"
        stroke="currentColor"
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
      xmlns="http://www.w3.org/2000/svg"
      className={'h-3 w-3'}
      fill="none"
      viewBox="1097 744 136 136"
    >
      <filter
        xmlns="http://www.w3.org/2000/svg"
        x="0%"
        y="0%"
        width="100%"
        xlinkType="simple"
        xlinkActuate="onLoad"
        height="100%"
        id="id1"
        xlinkShow="other"
      >
        <feColorMatrix
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
          colorInterpolationFilters="sRGB"
        />
      </filter>
      <filter
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0%"
        y="0%"
        width="100%"
        xlinkType="simple"
        xlinkActuate="onLoad"
        height="100%"
        id="id2"
        xlinkShow="other"
      >
        <feColorMatrix
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.2126 0.7152 0.0722 0 0"
          colorInterpolationFilters="sRGB"
        />
      </filter>

      <g xmlns="http://www.w3.org/2000/svg" clipPath="url(#id36)">
        <g clipPath="url(#id37)">
          <g mask="url(#id38)">
            <g transform="matrix(0.425557, 0, 0, 0.425207, 1097.354123, 744.503801)">
              <image
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0"
                y="0"
                width="316"
                xlinkHref="data:image/png;base64,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"
                xlinkType="simple"
                xlinkActuate="onLoad"
                height="315"
                preserveAspectRatio="xMidYMid meet"
                xlinkShow="embed"
              />
            </g>
          </g>
        </g>
      </g>
      <clipPath xmlns="http://www.w3.org/2000/svg" id="id36">
        <path
          d="M 1097.566406 745 L 1231.507812 745 L 1231.507812 878 L 1097.566406 878 Z M 1097.566406 745 "
          clipRule="nonzero"
        />
      </clipPath>
      <clipPath xmlns="http://www.w3.org/2000/svg" id="id37">
        <path
          d="M 1231.507812 811.472656 C 1231.507812 848.460938 1201.523438 878.445312 1164.535156 878.445312 C 1127.550781 878.445312 1097.566406 848.460938 1097.566406 811.472656 C 1097.566406 774.488281 1127.550781 744.503906 1164.535156 744.503906 C 1201.523438 744.503906 1231.507812 774.488281 1231.507812 811.472656 Z M 1231.507812 811.472656 "
          clipRule="nonzero"
        />
      </clipPath>
      <mask xmlns="http://www.w3.org/2000/svg" id="id38">
        <g filter="url(#id1)">
          <g
            filter="url(#id2)"
            transform="matrix(0.425557, 0, 0, 0.425207, 1097.354123, 744.503801)"
          >
            <image
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0"
              y="0"
              width="316"
              xlinkHref="data:image/png;base64,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"
              xlinkType="simple"
              xlinkActuate="onLoad"
              height="315"
              preserveAspectRatio="xMidYMid meet"
              xlinkShow="embed"
            />
          </g>
        </g>
      </mask>
    </svg>
  );

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
  gradient = false,
}: {
  className?: string;
  gradient?: boolean;
}) {
  return (
    <svg className={className} viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1084_6329)">
        <path
          d="M2.48681 9.65948C2.5792 9.56708 2.70625 9.51318 2.84099 9.51318H15.0604C15.2837 9.51318 15.3954 9.78267 15.2375 9.94052L12.8237 12.3544C12.7313 12.4468 12.6042 12.5007 12.4695 12.5007H0.25004C0.0267485 12.5007 -0.0848973 12.2312 0.0729468 12.0733L2.48681 9.65948Z"
          fill={gradient ? 'url(#paint0_linear_1084_6329)' : '#A8A8A8'}
        ></path>
        <path
          d="M2.48681 0.646295C2.58305 0.553898 2.7101 0.5 2.84099 0.5H15.0604C15.2837 0.5 15.3954 0.76949 15.2375 0.927334L12.8237 3.34119C12.7313 3.43359 12.6042 3.48749 12.4695 3.48749H0.25004C0.0267485 3.48749 -0.0848973 3.218 0.0729468 3.06015L2.48681 0.646295Z"
          fill={gradient ? 'url(#paint1_linear_1084_6329)' : '#A8A8A8'}
        ></path>
        <path
          d="M12.8237 5.12286C12.7313 5.03046 12.6042 4.97656 12.4695 4.97656H0.25004C0.0267485 4.97656 -0.0848973 5.24605 0.0729468 5.4039L2.48681 7.81776C2.5792 7.91015 2.70625 7.96405 2.84099 7.96405H15.0604C15.2837 7.96405 15.3954 7.69456 15.2375 7.53672L12.8237 5.12286Z"
          fill={gradient ? 'url(#paint2_linear_1084_6329)' : '#A8A8A8'}
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

function SauceIcon({ className = 'h-4 w-auto' }: { className?: string }) {
  return (
    <svg className="h-4 w-auto" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.7414 8.09734C15.7414 12.1876 12.4395 15.5 8.3707 15.5C4.30188 15.5 1 12.1876 1 8.09734C1 4.00704 4.30188 0.694656 8.3707 0.694656C12.4395 0.694656 15.7414 4.00704 15.7414 8.09734Z"
        fill="#17161C"
        stroke="url(#paint0_linear_38_3655)"
      />
      <path
        d="M15.9927 7.63657L15.9927 7.63652C15.8201 3.88408 12.8271 0.799941 9.07484 0.518842L9.07482 0.51884C7.0522 0.367221 5.22486 1.14666 3.79788 2.3949C3.98111 2.38629 4.16574 2.38198 4.35164 2.38198C6.33168 2.38198 8.17516 2.87843 9.68643 3.84803C9.9647 3.50397 10.1749 3.11324 10.2933 2.70449L10.2934 2.704C10.4713 2.09216 11.3358 2.09216 11.5137 2.704L11.5138 2.70438C11.8223 3.76826 12.7413 4.68623 13.808 4.99437L13.8088 4.99462C14.4179 5.17176 14.4251 6.03759 13.8071 6.21488M15.9927 7.63657L13.6692 5.73426M15.9927 7.63657C16.1013 9.99338 14.9783 12.1478 13.29 13.6042M15.9927 7.63657L13.29 13.6042M13.8071 6.21488L13.6692 5.73426M13.8071 6.21488C13.8074 6.21478 13.8078 6.21468 13.8081 6.21458L13.6692 5.73426M13.8071 6.21488C13.3338 6.35194 12.8854 6.61098 12.5055 6.95505M13.6692 5.73426C13.6417 5.74221 13.6143 5.7505 13.587 5.75914L13.5304 5.95508C13.4454 5.93053 13.3613 5.90311 13.278 5.87296C12.7535 6.09392 12.2761 6.43949 11.8886 6.86488M12.5055 6.95505C12.4472 6.84115 12.3867 6.72915 12.3238 6.61906L11.9254 6.84654L11.8886 6.86488M12.5055 6.95505C13.1489 8.21395 13.5057 9.70503 13.5057 11.4047C13.5057 12.1825 13.4316 12.9162 13.29 13.6042M12.5055 6.95505L13.29 13.6042M11.8886 6.86488L11.8904 6.86654L11.8896 6.86698L11.8886 6.86488ZM2.52789 2.96673C2.51859 2.9775 2.50932 2.98828 2.50007 2.99908M2.52789 2.96673L2.52798 2.96663C2.60831 2.87362 2.69051 2.78197 2.77454 2.69182C2.81097 2.72495 2.84502 2.76572 2.87294 2.81492C2.90357 2.86891 2.92116 2.92307 2.93016 2.97321C2.79876 2.99046 2.66839 3.01014 2.53909 3.03224M2.52789 2.96673L2.53909 3.03224M2.52789 2.96673L2.53909 3.03224M2.50007 2.99908C2.46015 3.04576 2.43762 3.06096 2.43806 3.06165C2.43855 3.06244 2.46934 3.04408 2.53885 3.03228L2.50007 2.99908ZM2.50007 2.99908L2.53888 3.03227C2.53895 3.03226 2.53902 3.03225 2.53909 3.03224M13.3525 5.36662C13.3953 5.31606 13.4545 5.2759 13.5303 5.25395C13.4452 5.27856 13.361 5.30601 13.2779 5.33617C13.3027 5.3466 13.3275 5.35675 13.3525 5.36662ZM3.2295 2.9383C3.59649 2.90083 3.97093 2.88198 4.35164 2.88198C6.40698 2.88198 8.28545 3.43993 9.76417 4.5054C10.1343 4.14079 10.4356 3.70608 10.6351 3.23338C10.6051 3.15076 10.5778 3.06722 10.5534 2.98288L10.7484 2.92631C10.7571 2.89885 10.7655 2.87128 10.7735 2.84363C10.8117 2.71228 10.9954 2.71228 11.0336 2.84363C11.0416 2.87126 11.05 2.8988 11.0587 2.92624L11.2538 2.98276C11.2537 2.98293 11.2537 2.98309 11.2536 2.98325L11.0588 2.92658C11.0837 3.00506 11.1114 3.08275 11.1418 3.15949C11.1916 3.1171 11.2312 3.05897 11.2531 2.9851C11.2288 3.06879 11.2017 3.15159 11.172 3.23341L3.2295 2.9383ZM10.6653 3.1595C10.6957 3.08276 10.7235 3.00507 10.7484 2.92658L10.5535 2.98325C10.5752 3.05801 10.6151 3.11676 10.6653 3.1595ZM13.5864 5.75933L13.5296 5.95483C13.4551 5.93316 13.3963 5.89293 13.3535 5.84214L13.5864 5.75933Z"
        fill="url(#paint1_linear_38_3655)"
        stroke="url(#paint2_linear_38_3655)"
      />
      <path
        d="M11.2757 6.81777C11.1377 6.99696 11.0127 7.18678 10.9033 7.38529C10.4952 6.64351 9.86574 6.01436 9.12339 5.60597C9.35913 5.47616 9.58273 5.32445 9.79097 5.15478C10.3663 5.6208 10.8668 6.17628 11.2757 6.81777Z"
        fill="url(#paint3_linear_38_3655)"
        stroke="url(#paint4_linear_38_3655)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_38_3655"
          x1="1.80274"
          y1="0.194656"
          x2="16.3573"
          y2="6.78207"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset="1" stopColor="#EC9D08" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_38_3655"
          x1="3.60179"
          y1="-8.86761e-08"
          x2="16.8115"
          y2="5.69517"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset="1" stopColor="#EC9D08" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_38_3655"
          x1="3.60179"
          y1="-8.86761e-08"
          x2="16.8115"
          y2="5.69517"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset="1" stopColor="#EC9D08" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_38_3655"
          x1="8.35756"
          y1="4.50641"
          x2="11.9447"
          y2="6.09189"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset="1" stopColor="#EC9D08" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_38_3655"
          x1="8.35756"
          y1="4.50641"
          x2="11.9447"
          y2="6.09189"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset="1" stopColor="#EC9D08" />
        </linearGradient>
      </defs>
    </svg>
  );
}

Icon.Sauce = SauceIcon;
