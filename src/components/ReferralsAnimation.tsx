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
    <>
      <LeafDark
        style={{
          bottom: '-35%',
          left: '15%',
        }}
      />
      <LeafDark
        style={{
          bottom: '-15%',
          left: '-10%',
        }}
      />
      <LeafDark
        inverted
        style={{
          transform: 'rotate(290deg)',
          bottom: '-30%',
          right: '10%',
        }}
      />
      <LeafDark
        inverted
        style={{
          transform: 'rotate(270deg)',
          bottom: '-10%',
          right: '-15%',
        }}
      />
      <LeafLight
        style={{
          bottom: '-25%',
          left: '7%',
        }}
      />
      <LeafLight
        inverted
        style={{
          transform: 'rotate(0) scaleX(-1)',
          bottom: '-25%',
          right: '0',
        }}
      />
      <LeafTall style={{ bottom: '-10%', left: '-30%' }} />
      <LeafTall
        inverted
        style={{
          transform: 'rotate(-45deg) ',
          bottom: '-5%',
          right: '-30%',
        }}
      />
    </>
  );
}

Animation.Leaves = Leaves;

interface LeafDarkProps {
  style: CSSProperties;
  inverted?: boolean;
}

function LeafDark({ style, inverted = false }: LeafDarkProps): JSX.Element {
  const [inside, setInside] = useState(false);
  const ref = createRef<SVGPathElement>();

  const handleEnter = useCallback(() => {
    setInside(true);
  }, []);
  const handleLeave = useCallback(() => {
    setInside(false);
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('mouseenter', handleEnter);
      ref.current.addEventListener('mouseleave', handleLeave);

      return () => {
        ref.current?.removeEventListener('mouseenter', handleEnter);
        ref.current?.removeEventListener('mouseleave', handleLeave);
      };
    }
  }, [ref.current]);

  return (
    <div className="pointer-events-none absolute " style={style}>
      <div
        className={clsx('pointer-events-none transition-transform duration-700 ease-in-out', {
          'translate-y-16 rotate-12': inside && !inverted,
          'translate-y-0 translate-x-16 rotate-6': inside && inverted,
        })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={741}
          height={797}
          viewBox="0 0 741 797"
          fill="none"
          className="pointer-events-none"
        >
          <g filter="url(#filter0_d_1150_49802)" className="pointer-events-none">
            <path
              ref={ref}
              d="M501.373 556.269C657.505 359.713 579.967 127.571 579.967 127.571C579.967 127.571 336.302 104.571 180.171 301.127C24.0388 497.684 118.354 621.959 160.601 655.518C202.849 689.077 345.241 752.826 501.373 556.269Z"
              fill="#0B0A0E"
              className="pointer-events-auto"
            />
          </g>
          <path
            d="M548.321 167.187C548.321 167.187 431.293 296.014 335.205 416.98C239.117 537.946 199.325 606.543 199.325 606.543"
            stroke="url(#paint0_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M552.61 351.853C552.61 351.853 529.74 368.87 481.234 374.43C432.727 379.99 388.929 376.819 388.929 376.819"
            stroke="url(#paint1_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M354.02 204.349C354.02 204.349 343.667 240.638 348.207 280.967C352.747 321.296 363.478 356.157 363.478 356.157"
            stroke="url(#paint2_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M475.985 164.061C475.985 164.061 448.875 190.311 432.642 227.507C416.409 264.703 408.272 300.259 408.272 300.259"
            stroke="url(#paint3_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M561.453 236.404C561.453 236.404 539.198 266.88 504.6 288.094C470.002 309.308 435.911 322.277 435.911 322.277"
            stroke="url(#paint4_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M511.455 486.215C511.455 486.215 470.222 485.437 429.48 467.755C388.738 450.072 355.676 427.653 355.676 427.653"
            stroke="url(#paint5_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M243.098 284.562C243.098 284.562 251.32 317.843 273.158 347.472C294.996 377.101 319.261 399.591 319.261 399.591"
            stroke="url(#paint6_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M424.11 596.712C424.11 596.712 385.267 582.858 352.266 553.133C319.266 523.409 302.913 496.879 302.913 496.879"
            stroke="url(#paint7_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <path
            d="M160.524 388.515C160.524 388.515 178.908 417.341 209.085 438.374C239.262 459.407 263.783 467.556 263.783 467.556"
            stroke="url(#paint8_linear_1150_49802)"
            strokeWidth="11.4036"
            strokeLinecap="round"
          />
          <defs>
            <filter
              id="filter0_d_1150_49802"
              x="1.72643"
              y="47.1515"
              width="689.331"
              height="749.649"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="12.2449" />
              <feGaussianBlur stdDeviation="45.9185" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.027451 0 0 0 0.73 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1150_49802"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1150_49802"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_1150_49802"
              x1="543.816"
              y1="163.608"
              x2="194.82"
              y2="602.964"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_1150_49802"
              x1="621.723"
              y1="372.517"
              x2="321.776"
              y2="424.401"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="paint2_linear_1150_49802"
              x1="323.569"
              y1="166.854"
              x2="338.483"
              y2="419.497"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="paint3_linear_1150_49802"
              x1="468.361"
              y1="116.363"
              x2="354.956"
              y2="342.616"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="paint4_linear_1150_49802"
              x1="609.746"
              y1="237.369"
              x2="401.322"
              y2="380.931"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="paint5_linear_1150_49802"
              x1="541.028"
              y1="530.147"
              x2="281.131"
              y2="434.595"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="paint6_linear_1150_49802"
              x1="202.032"
              y1="269.043"
              x2="328.518"
              y2="460.603"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="paint7_linear_1150_49802"
              x1="437.338"
              y1="645.195"
              x2="277.829"
              y2="513.813"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
            <linearGradient
              id="paint8_linear_1150_49802"
              x1="118.778"
              y1="387.126"
              x2="288.049"
              y2="521.84"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" />
              <stop offset={1} stopColor="#17161C" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

interface LeafLightProps {
  style: CSSProperties;
  inverted?: boolean;
}

function LeafLight({ style, inverted = false }: LeafLightProps): JSX.Element {
  const [inside, setInside] = useState(false);
  const ref = createRef<SVGPathElement>();

  const handleEnter = useCallback(() => {
    setInside(true);
  }, []);
  const handleLeave = useCallback(() => {
    setInside(false);
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('mouseenter', handleEnter);
      ref.current.addEventListener('mouseleave', handleLeave);

      return () => {
        ref.current?.removeEventListener('mouseenter', handleEnter);
        ref.current?.removeEventListener('mouseleave', handleLeave);
      };
    }
  }, [ref.current]);

  return (
    <div className="pointer-events-none absolute" style={style}>
      <div
        className={clsx('pointer-events-none transition-transform duration-700 ease-in-out', {
          'translate-y-16 rotate-12': inside && !inverted,
          '-translate-y-0 -rotate-12': inside && inverted,
        })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={628}
          height={639}
          viewBox="0 0 628 639"
          fill="none"
          className="pointer-events-none"
        >
          <g filter="url(#filter0_d_1152_49942)" className="pointer-events-none">
            <path
              ref={ref}
              className="pointer-events-auto"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M348.277 107.382C333.809 123.912 324.879 146.173 332.294 174.288C349.349 238.948 283.503 177.669 303.222 114.738C271.549 121.523 237.805 132.335 204.963 149.253C203.961 172.938 213.496 199.515 248.685 216.962C322.555 253.588 188.68 248.313 167.715 173.225C167.583 172.753 167.455 172.283 167.332 171.814C144.047 187.951 121.871 207.818 101.982 232.239C97.9861 237.145 94.3275 241.901 90.9868 246.51C101.839 271.423 137.065 311.952 202.559 296.129C287.925 275.506 183.49 353.61 106.033 316.343C87.9473 307.641 75.8006 296.927 68.183 286.106C46.8709 338.481 76.0417 365.258 102.226 380.375C170.948 420.052 195.729 397.994 207.691 387.347C211.496 383.961 214.003 381.729 216.215 383.006C218.35 384.238 217.592 387.227 216.43 391.812C212.602 406.918 204.381 439.355 280.696 483.415C314.144 502.726 346.407 512.852 388.532 484.703C372.413 482.302 354.7 476.012 337.082 463.944C260.365 411.389 304.717 283.294 313.491 365.86C320.21 429.085 392.86 449.096 428.61 449.119C433.884 443.378 439.31 437.092 444.903 430.224C467.835 402.067 482.964 373.703 492.34 346.096C476.779 350.468 457.228 352.594 434.098 350.282C338.093 340.686 314.067 237.277 369.203 291.341C410.392 331.729 471.235 321.168 501.753 309.013C507.188 277.237 505.805 247.153 501.052 220.379C439.143 269.916 331.079 237.218 413.576 226.712C455.525 221.369 478.434 199.523 489.996 177.283C475.551 134.268 456.067 106.993 456.067 106.993C456.067 106.993 410.33 100.269 348.277 107.382Z"
              fill="#100F14"
            />
          </g>
          <path
            d="M450.214 117.099C450.214 117.099 332.294 225.389 292.584 274.147C252.875 322.905 221.523 376.488 221.523 376.488"
            stroke="url(#paint0_linear_1152_49942)"
            strokeWidth={12}
            strokeLinecap="round"
          />
          <defs>
            <filter
              id="filter0_d_1152_49942"
              x="-59.1777"
              y="0.116699"
              width="684.44"
              height="637.991"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy={16} />
              <feGaussianBlur stdDeviation={60} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.027451 0 0 0 0.73 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1152_49942"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1152_49942"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_1152_49942"
              x1="446.035"
              y1="114.686"
              x2="262.56"
              y2="432.475"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

interface LeafTallProps {
  style: CSSProperties;
  inverted?: boolean;
}

function LeafTall({ style, inverted = false }: LeafTallProps): JSX.Element {
  const [inside, setInside] = useState(false);
  const ref = createRef<SVGSVGElement>();

  const handleEnter = useCallback(() => {
    setInside(true);
  }, []);
  const handleLeave = useCallback(() => {
    setInside(false);
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('mouseenter', handleEnter);
      ref.current.addEventListener('mouseleave', handleLeave);

      return () => {
        ref.current?.removeEventListener('mouseenter', handleEnter);
        ref.current?.removeEventListener('mouseleave', handleLeave);
      };
    }
  }, [ref.current]);

  return (
    <div className="pointer-events-none absolute" style={style}>
      <div
        className={clsx('pointer-events-none transition-transform duration-700 ease-in-out', {
          'translate-x-8 rotate-6': inside && !inverted,
          '-translate-x-8 -rotate-6': inside && inverted,
        })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={715}
          height={733}
          viewBox="0 0 715 733"
          fill="none"
          ref={ref}
          className="pointer-events-auto"
        >
          <g
            style={{
              transform: inverted ? 'translateX(-175px) translateY(-100px)' : 'translateX(175px)',
            }}
          >
            <path
              d="M382.016 112.209L388.949 155.309C396.663 203.264 379.897 251.9 344.271 284.915L332.164 296.134C298.767 327.083 285.98 374.388 299.236 417.947V417.947C312.444 461.349 299.8 508.485 266.643 539.449L217.228 585.596"
              stroke="url(#paint0_linear_1150_49681)"
              strokeWidth={12}
              strokeLinecap="round"
            />
            <g>
              <g filter="url(#filter0_d_1150_49681)">
                <path
                  d="M364.738 205.145C373.853 245.93 356.644 284.491 342.528 287.646C328.411 290.801 296.423 263.236 287.308 222.45C278.192 181.665 295.401 143.104 309.518 139.949C323.634 136.794 355.622 164.359 364.738 205.145Z"
                  fill="#100F14"
                />
              </g>
              <path
                d="M310.555 150.662C310.555 150.662 330.532 203.738 335.511 226.012C340.489 248.286 342.272 271.274 342.272 271.274"
                stroke="url(#paint1_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M356.796 224.037C356.796 224.037 352.936 232.557 350.919 235.735C348.902 238.913 346.429 241.802 346.429 241.802"
                stroke="url(#paint2_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M304.053 231.554C304.053 231.554 315.264 239.939 320.334 242.191C325.404 244.444 330.995 245.521 330.995 245.521"
                stroke="url(#paint3_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M346.704 178.886C346.704 178.886 342.844 187.405 340.827 190.583C338.81 193.762 336.337 196.65 336.337 196.65"
                stroke="url(#paint4_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M294.923 190.031C294.923 190.031 305.712 195.885 310.3 197.774C314.887 199.662 319.68 201.051 319.68 201.051"
                stroke="url(#paint5_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
            </g>
            <g filter="url(#filter1_d_1150_49681)">
              <path
                d="M225.716 452.424C245.076 489.46 283.109 507.807 295.928 501.106C308.747 494.405 315.389 452.704 296.029 415.668C276.668 378.631 238.635 360.284 225.816 366.985C212.997 373.686 206.355 415.387 225.716 452.424Z"
                fill="#100F14"
              />
            </g>
            <path
              d="M231.938 375.838C231.938 375.838 250.935 429.272 261.508 449.499C272.082 469.726 285.556 488.436 285.556 488.436"
              stroke="url(#paint6_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M243.976 461.728C243.976 461.728 252.422 465.744 256.014 466.87C259.606 467.996 263.359 468.606 263.359 468.606"
              stroke="url(#paint7_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M289.113 433.429C289.113 433.429 285.961 447.069 283.542 452.062C281.124 457.055 277.548 461.487 277.548 461.487"
              stroke="url(#paint8_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M222.543 420.727C222.543 420.727 230.99 424.743 234.582 425.869C238.173 426.995 241.927 427.605 241.927 427.605"
              stroke="url(#paint9_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M269.288 395.82C269.288 395.82 264.825 407.255 262.539 411.658C260.254 416.061 257.49 420.216 257.49 420.216"
              stroke="url(#paint10_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <g filter="url(#filter2_d_1150_49681)">
              <path
                d="M377.724 379.911C337.158 389.956 298.214 373.632 294.737 359.592C291.26 345.551 318.088 312.942 358.654 302.897C399.221 292.852 438.165 309.176 441.641 323.216C445.118 337.257 418.291 369.867 377.724 379.911Z"
                fill="#100F14"
              />
            </g>
            <path
              d="M432.386 326.442C432.386 326.442 380.945 331.439 358.79 336.925C336.636 342.411 307.062 357.027 307.062 357.027"
              stroke="url(#paint11_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M349.672 319.004C349.672 319.004 343.446 325.983 341.357 329.114C339.268 332.246 337.628 335.676 337.628 335.676"
              stroke="url(#paint12_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M364.413 370.753C364.413 370.753 352.208 363.897 348.095 360.174C343.983 356.45 340.733 351.774 340.733 351.774"
              stroke="url(#paint13_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M396.653 307.901C396.653 307.901 390.426 314.88 388.337 318.011C386.248 321.142 384.608 324.573 384.608 324.573"
              stroke="url(#paint14_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M405.155 360.87C405.155 360.87 395.433 353.375 391.849 349.945C388.265 346.515 385.054 342.696 385.054 342.696"
              stroke="url(#paint15_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <g filter="url(#filter3_d_1150_49681)">
              <path
                d="M285.246 628.771C243.491 627.019 210.698 600.416 211.304 585.964C211.91 571.512 246.816 547.749 288.571 549.5C330.326 551.251 363.119 577.854 362.512 592.306C361.906 606.758 327.001 630.522 285.246 628.771Z"
                fill="#100F14"
              />
            </g>
            <path
              d="M352.724 592.804C352.724 592.804 301.948 583.154 279.145 582.197C256.341 581.241 223.853 586.964 223.853 586.964"
              stroke="url(#paint16_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M275.428 562.437C275.428 562.437 267.492 567.387 264.608 569.806C261.724 572.224 259.186 575.056 259.186 575.056"
              stroke="url(#paint17_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M275.043 616.243C275.043 616.243 265.254 606.235 262.352 601.507C259.451 596.778 257.645 591.377 257.645 591.377"
              stroke="url(#paint18_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M323.635 564.974C323.635 564.974 315.699 569.924 312.815 572.343C309.931 574.761 307.393 577.593 307.393 577.593"
              stroke="url(#paint19_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <path
              d="M316.921 618.199C316.921 618.199 309.695 608.276 307.218 603.978C304.742 599.68 302.733 595.112 302.733 595.112"
              stroke="url(#paint20_linear_1150_49681)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <g>
              <g filter="url(#filter4_d_1150_49681)">
                <path
                  d="M470.384 196.185C429.818 206.23 390.874 189.906 387.397 175.865C383.92 161.825 410.748 129.215 451.314 119.17C491.881 109.125 530.825 125.449 534.302 139.49C537.778 153.53 510.951 186.14 470.384 196.185Z"
                  fill="#100F14"
                />
              </g>
              <path
                d="M525.047 142.716C525.047 142.716 473.605 147.713 451.45 153.198C429.296 158.684 399.722 173.3 399.722 173.3"
                stroke="url(#paint21_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M442.334 135.279C442.334 135.279 436.107 142.258 434.018 145.389C431.929 148.52 430.289 151.951 430.289 151.951"
                stroke="url(#paint22_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M457.075 187.027C457.075 187.027 444.869 180.171 440.756 176.447C436.644 172.724 433.394 168.048 433.394 168.048"
                stroke="url(#paint23_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M489.313 124.175C489.313 124.175 483.087 131.154 480.997 134.285C478.908 137.417 477.268 140.847 477.268 140.847"
                stroke="url(#paint24_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
              <path
                d="M497.815 177.143C497.815 177.143 488.094 169.648 484.509 166.219C480.925 162.789 477.714 158.969 477.714 158.969"
                stroke="url(#paint25_linear_1150_49681)"
                strokeWidth={5}
                strokeLinecap="round"
              />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_d_1150_49681"
              x="164.76"
              y="35.7031"
              width="322.525"
              height="388.188"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy={16} />
              <feGaussianBlur stdDeviation={60} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.027451 0 0 0 0.73 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1150_49681"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1150_49681"
                result="shape"
              />
            </filter>
            <filter
              id="filter1_d_1150_49681"
              x="93.5688"
              y="261.625"
              width="334.606"
              height="376.842"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy={16} />
              <feGaussianBlur stdDeviation={60} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.027451 0 0 0 0.73 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1150_49681"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1150_49681"
                result="shape"
              />
            </filter>
            <filter
              id="filter2_d_1150_49681"
              x="174.435"
              y="195.79"
              width="387.509"
              height="323.229"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy={16} />
              <feGaussianBlur stdDeviation={60} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.027451 0 0 0 0.73 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1150_49681"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1150_49681"
                result="shape"
              />
            </filter>
            <filter
              id="filter3_d_1150_49681"
              x="102.296"
              y="445.408"
              width="391.225"
              height="319.454"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dx={11} dy={16} />
              <feGaussianBlur stdDeviation={60} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.027451 0 0 0 0.73 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1150_49681"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1150_49681"
                result="shape"
              />
            </filter>
            <filter
              id="filter4_d_1150_49681"
              x="267.095"
              y="12.0635"
              width="387.509"
              height="323.229"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity={0} result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy={16} />
              <feGaussianBlur stdDeviation={60} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.027451 0 0 0 0.73 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1150_49681"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1150_49681"
                result="shape"
              />
            </filter>
            <linearGradient
              id="paint0_linear_1150_49681"
              x1="384.656"
              y1="74.9626"
              x2="181.617"
              y2="667.301"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#212026" stopOpacity={0} />
              <stop offset={1} stopColor="#212026" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_1150_49681"
              x1="301.289"
              y1="101.696"
              x2="341.578"
              y2="281.964"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_1150_49681"
              x1="361.425"
              y1="217.246"
              x2="345.101"
              y2="242.967"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_1150_49681"
              x1="292.728"
              y1="227.226"
              x2="333.759"
              y2="245.456"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint4_linear_1150_49681"
              x1="351.334"
              y1="172.095"
              x2="335.009"
              y2="197.816"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint5_linear_1150_49681"
              x1="284.809"
              y1="186.16"
              x2="321.935"
              y2="201.443"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint6_linear_1150_49681"
              x1="207.413"
              y1="332.455"
              x2="292.986"
              y2="496.154"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint7_linear_1150_49681"
              x1="236.056"
              y1="459.529"
              x2="265.126"
              y2="468.64"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint8_linear_1150_49681"
              x1="294.97"
              y1="422.814"
              x2="275.395"
              y2="463.221"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint9_linear_1150_49681"
              x1="214.624"
              y1="418.528"
              x2="243.693"
              y2="427.639"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint10_linear_1150_49681"
              x1="274.515"
              y1="386.336"
              x2="256.02"
              y2="421.971"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint11_linear_1150_49681"
              x1="479.697"
              y1="314.115"
              x2="300.395"
              y2="358.512"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint12_linear_1150_49681"
              x1="354.007"
              y1="312.021"
              x2="337.099"
              y2="337.362"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint13_linear_1150_49681"
              x1="372.957"
              y1="379.355"
              x2="339.673"
              y2="349.221"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint14_linear_1150_49681"
              x1="400.987"
              y1="300.918"
              x2="384.08"
              y2="326.259"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint15_linear_1150_49681"
              x1="412.79"
              y1="368.55"
              x2="383.782"
              y2="340.792"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint16_linear_1150_49681"
              x1="401.592"
              y1="594.258"
              x2="217.038"
              y2="586.517"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint17_linear_1150_49681"
              x1="281.549"
              y1="556.952"
              x2="258.206"
              y2="576.526"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint18_linear_1150_49681"
              x1="280.827"
              y1="626.898"
              x2="257.345"
              y2="588.629"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint19_linear_1150_49681"
              x1="329.756"
              y1="559.49"
              x2="306.413"
              y2="579.063"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint20_linear_1150_49681"
              x1="322.092"
              y1="627.714"
              x2="302.047"
              y2="592.928"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint21_linear_1150_49681"
              x1="572.357"
              y1="130.388"
              x2="393.056"
              y2="174.786"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint22_linear_1150_49681"
              x1="446.668"
              y1="128.296"
              x2="429.761"
              y2="153.637"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint23_linear_1150_49681"
              x1="465.618"
              y1="195.629"
              x2="432.334"
              y2="165.494"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint24_linear_1150_49681"
              x1="493.648"
              y1="117.192"
              x2="476.74"
              y2="142.533"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
            <linearGradient
              id="paint25_linear_1150_49681"
              x1="505.45"
              y1="184.823"
              x2="476.443"
              y2="157.065"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#17161C" stopOpacity={0} />
              <stop offset={1} stopColor="#17161C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
