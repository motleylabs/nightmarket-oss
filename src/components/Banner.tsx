import { useWallet } from '@solana/wallet-adapter-react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useBuddyStats } from '../hooks/referrals';
import Button, { ButtonBackground } from './Button';

export default function Banner() {
  const { t } = useTranslation('referrals');

  const { publicKey } = useWallet();

  const { data, loading } = useBuddyStats({
    wallet: publicKey?.toString()!,
  });

  return (
    <div className="relative mt-14 w-full overflow-hidden rounded-2xl bg-gradient-primary">
      <div className="pointer-events-none absolute w-full lg:flex lg:h-full lg:items-center">
        <StarBackground className="relative -left-[15%] top-[20px] h-auto w-[110%] lg:left-[25%] lg:top-0 lg:w-[75%]" />
      </div>
      <div className="p-6 md:p-11 lg:flex lg:flex-row-reverse lg:justify-between">
        <div className="faded-gradient-text md:flex md:flex-col md:items-center lg:ml-12 lg:w-full lg:justify-center">
          <div className="-mt-4 pt-4">
            <div className="text-xl font-semibold md:text-2xl xl:text-2xl">
              {t('banner.upTo', { ns: 'referrals' })}
            </div>
            <div className="text-[92px] font-bold leading-[76px] md:text-[164px] md:leading-[140px] xl:text-[140px]">
              100%
            </div>
          </div>
        </div>
        <div className="mt-8 md:mt-16 md:flex lg:mt-0 lg:block xl:max-w-[456px]">
          <div className="md:w-2/3 lg:w-auto">
            <div className="w-[265px] text-2xl font-bold leading-[32px] text-white md:w-auto md:text-[32px] md:font-normal md:leading-[40px]">
              {t('banner.joinAffiliate', { ns: 'referrals' })}
            </div>
            <div className="mt-2 w-[265px] text-sm font-semibold text-white opacity-60 md:w-auto md:pr-6 md:text-base">
              {t('banner.instruction', { ns: 'referrals' })}
            </div>
          </div>
          <div className="lg:auto mt-6 md:mt-0 md:flex md:w-1/3 md:items-end md:justify-center lg:mt-7 lg:w-auto lg:justify-start">
            <Link
              href={
                !loading && data?.username
                  ? `/profiles/${publicKey?.toString()}/affiliate`
                  : '/referrals'
              }
            >
              <Button background={ButtonBackground.FullBlack}>
                {!loading && data?.username
                  ? t('banner.seeDashboard', { ns: 'referrals' })
                  : t('banner.createReferral', { ns: 'referrals' })}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarBackground({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 952 300" fill="none">
      <path
        d="M176 202.851C176 202.851 288.802 109.851 269.5 125.851C178.377 201.385 183.024 220.046 183.473 221.283L183.5 221.351C183.5 221.351 183.489 221.329 183.473 221.283L176 202.851Z"
        fill="url(#paint0_linear_1515_51939)"
      />
      <path
        d="M186.186 205.806C188.731 210.982 192.646 215.566 197.5 218.676C198.44 219.28 198.011 220.678 196.895 220.652C186.43 220.399 175.777 225.845 170.126 234.341C169.522 235.253 168.079 234.811 168.09 233.718C168.126 228.552 166.652 223.303 164.052 218.659C161.524 214.131 157.931 210.152 153.577 207.353C153.107 207.051 152.977 206.558 153.104 206.143C153.231 205.729 153.615 205.393 154.173 205.406C164.64 205.649 175.291 200.213 180.942 191.717C181.545 190.805 182.989 191.247 182.978 192.34C182.946 196.928 184.098 201.572 186.186 205.806Z"
        fill="url(#paint1_linear_1515_51939)"
      />
      <g opacity="0.6">
        <path
          d="M988.163 277.713C990.901 283.283 995.114 288.214 1000.34 291.561C1001.35 292.211 1000.89 293.715 999.685 293.687C988.426 293.415 976.963 299.275 970.883 308.416C970.233 309.397 968.681 308.921 968.692 307.745C968.731 302.187 967.145 296.54 964.347 291.542C961.628 286.671 957.761 282.389 953.076 279.377C952.571 279.053 952.431 278.522 952.567 278.076C952.704 277.63 953.117 277.269 953.718 277.282C964.981 277.544 976.44 271.695 982.52 262.553C983.17 261.573 984.723 262.048 984.711 263.224C984.677 268.16 985.917 273.157 988.163 277.713Z"
          fill="url(#paint2_linear_1515_51939)"
        />
      </g>
      <path
        d="M885.743 164.004C885.743 164.004 993.081 37.2854 974.616 58.9676C887.444 161.327 866.319 155.766 864.92 155.238L864.844 155.206C864.844 155.206 864.868 155.219 864.92 155.238L885.743 164.004Z"
        fill="url(#paint3_linear_1515_51939)"
      />
      <path
        d="M889.512 148.657C892.403 154.537 896.851 159.744 902.365 163.277C903.432 163.963 902.946 165.551 901.677 165.521C889.79 165.234 877.689 171.42 871.27 181.071C870.584 182.107 868.945 181.605 868.956 180.363C868.997 174.495 867.323 168.533 864.37 163.257C861.499 158.114 857.417 153.594 852.471 150.414C851.937 150.071 851.789 149.511 851.933 149.04C852.078 148.569 852.514 148.188 853.148 148.203C865.038 148.479 877.136 142.304 883.556 132.653C884.241 131.617 885.881 132.119 885.869 133.361C885.833 138.572 887.141 143.847 889.512 148.657Z"
        fill="url(#paint4_linear_1515_51939)"
      />
      <g opacity="0.1">
        <path
          d="M721 25.1182C721 25.1182 779.922 -24.5578 769.839 -16.0114C722.241 24.3353 724.669 34.303 724.903 34.9638L724.918 35C724.918 35 724.912 34.9883 724.903 34.9638L721 25.1182Z"
          fill="url(#paint5_linear_1515_51939)"
        />
        <path
          d="M720.581 19.4818C724.495 19.743 728.527 18.9953 732.009 17.194C732.685 16.846 733.363 17.5735 732.968 18.2225C729.26 24.3006 728.845 32.4279 731.927 38.6462C732.259 39.3118 731.508 40.0116 730.867 39.6336C727.837 37.8556 724.244 36.9389 720.624 36.8907C717.097 36.8397 713.531 37.6033 710.402 39.2162C710.064 39.3902 709.729 39.2991 709.528 39.0833C709.327 38.8676 709.26 38.5272 709.458 38.2027C713.161 32.1196 713.58 23.9973 710.498 17.779C710.166 17.1135 710.917 16.4136 711.558 16.7916C714.249 18.3704 717.376 19.2713 720.581 19.4818Z"
          fill="url(#paint6_linear_1515_51939)"
        />
      </g>
      <path
        d="M239.801 63.6478C239.801 63.6478 315.221 1.55276 302.315 12.2357C241.39 62.6691 244.497 75.1287 244.797 75.9548L244.815 76C244.815 76 244.808 75.9854 244.797 75.9548L239.801 63.6478Z"
        fill="url(#paint7_linear_1515_51939)"
      />
      <path
        d="M239.69 61.0804C243.261 61.3187 246.94 60.6364 250.118 58.9929C250.734 58.6754 251.352 59.3391 250.992 59.9313C247.609 65.4771 247.23 72.8927 250.043 78.5664C250.346 79.1737 249.66 79.8122 249.076 79.4673C246.311 77.845 243.032 77.0086 239.729 76.9646C236.512 76.9181 233.258 77.6148 230.402 79.0865C230.094 79.2452 229.789 79.1621 229.605 78.9652C229.422 78.7684 229.361 78.4578 229.541 78.1618C232.92 72.6113 233.303 65.2004 230.49 59.5267C230.187 58.9194 230.873 58.2809 231.457 58.6258C233.913 60.0662 236.766 60.8882 239.69 61.0804Z"
        fill="url(#paint8_linear_1515_51939)"
      />
      <path
        opacity="0.7"
        d="M782.685 307.346C782.685 307.346 821.805 275.093 815.111 280.642C783.509 306.838 785.121 313.309 785.276 313.738L785.286 313.762C785.286 313.762 785.282 313.754 785.276 313.738L782.685 307.346Z"
        fill="url(#paint9_linear_1515_51939)"
      />
      <path
        d="M782.432 304.458C784.506 304.596 786.642 304.2 788.487 303.246C788.844 303.061 789.203 303.447 788.994 303.791C787.03 307.011 786.81 311.316 788.443 314.61C788.619 314.963 788.221 315.334 787.882 315.133C786.276 314.191 784.373 313.706 782.455 313.68C780.587 313.653 778.698 314.058 777.04 314.912C776.861 315.004 776.684 314.956 776.577 314.842C776.471 314.728 776.435 314.547 776.54 314.375C778.501 311.153 778.724 306.85 777.091 303.556C776.915 303.203 777.313 302.832 777.652 303.033C779.078 303.869 780.735 304.346 782.432 304.458Z"
        fill="url(#paint10_linear_1515_51939)"
      />
      <g opacity="0.6">
        <path
          opacity="0.7"
          d="M264.992 292.099C264.992 292.099 337.281 214.556 324.848 227.821C266.158 290.443 252.856 286.256 251.981 285.877L251.933 285.854C251.933 285.854 251.948 285.863 251.981 285.877L264.992 292.099Z"
          fill="url(#paint11_linear_1515_51939)"
        />
        <path
          d="M268.415 283.496C270.26 287.249 273.1 290.573 276.619 292.828C277.3 293.266 276.99 294.28 276.18 294.261C268.592 294.078 260.867 298.027 256.769 304.187C256.332 304.849 255.285 304.528 255.293 303.735C255.319 299.989 254.25 296.183 252.365 292.816C250.532 289.533 247.926 286.647 244.769 284.617C244.428 284.398 244.334 284.041 244.426 283.74C244.518 283.44 244.796 283.196 245.201 283.205C252.792 283.382 260.514 279.44 264.612 273.279C265.05 272.618 266.097 272.939 266.089 273.731C266.066 277.058 266.901 280.425 268.415 283.496Z"
          fill="url(#paint12_linear_1515_51939)"
        />
      </g>
      <path
        d="M904 248.869C904 248.869 934.639 223.076 929.396 227.513C904.646 248.463 905.908 253.638 906.03 253.981L906.037 254C906.037 254 906.034 253.994 906.03 253.981L904 248.869Z"
        fill="url(#paint13_linear_1515_51939)"
      />
      <path
        d="M908.475 249.279C909.61 251.587 911.357 253.631 913.521 255.019C913.94 255.288 913.749 255.911 913.251 255.9C908.585 255.787 903.834 258.216 901.313 262.005C901.044 262.411 900.401 262.214 900.405 261.726C900.421 259.423 899.764 257.082 898.605 255.011C897.477 252.992 895.875 251.217 893.933 249.969C893.723 249.834 893.665 249.614 893.722 249.429C893.779 249.244 893.95 249.095 894.199 249.1C898.867 249.209 903.617 246.785 906.137 242.996C906.406 242.589 907.05 242.786 907.045 243.274C907.031 245.319 907.545 247.391 908.475 249.279Z"
        fill="url(#paint14_linear_1515_51939)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1515_51939"
          x1={268}
          y1="124.351"
          x2="155.5"
          y2="216.851"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.776372" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1515_51939"
          x1="147.974"
          y1="225.285"
          x2="177.005"
          y2="189.149"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1515_51939"
          x1="947.048"
          y1="298.672"
          x2="978.285"
          y2="259.791"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset={1} stopColor="#EC9D08" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1515_51939"
          x1="976.297"
          y1="60.694"
          x2="869.532"
          y2="187.077"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.776372" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1515_51939"
          x1="846.106"
          y1="170.784"
          x2="879.084"
          y2="129.736"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1515_51939"
          x1="769.056"
          y1="-16.8127"
          x2="709.237"
          y2="31.2845"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ED9708" stopOpacity={0} />
          <stop offset={1} stopColor="#ED9708" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1515_51939"
          x1="719.059"
          y1="48.615"
          x2="707.647"
          y2="19.2246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset={1} stopColor="#EC9D08" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1515_51939"
          x1="301.312"
          y1="11.2342"
          x2="226.177"
          y2="73.0962"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.776372" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1515_51939"
          x1="238.302"
          y1="87.6621"
          x2="227.889"
          y2="60.8457"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1515_51939"
          x1="814.591"
          y1="280.122"
          x2="775.575"
          y2="312.201"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.776372" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1515_51939"
          x1="781.626"
          y1="319.891"
          x2="775.58"
          y2="304.322"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F85C04" />
          <stop offset={1} stopColor="#EC9D08" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1515_51939"
          x1="325.868"
          y1="228.973"
          x2="253.955"
          y2="306.319"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.776372" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="paint12_linear_1515_51939"
          x1="240.706"
          y1="297.621"
          x2="261.758"
          y2="271.417"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_1515_51939"
          x1="928.989"
          y1="227.097"
          x2="897.92"
          y2="252.116"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.776372" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient
          id="paint14_linear_1515_51939"
          x1="891.434"
          y1="257.966"
          x2="904.381"
          y2="241.851"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
