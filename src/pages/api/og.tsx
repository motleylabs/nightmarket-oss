/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ImageResponse } from '@vercel/og';

import { NextRequest } from 'next/server';

import Icon from '../../components/Icon';

export const config = {
  runtime: 'edge',
};

export default function handler(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.search);

    const imageParam = searchParams.get('image');
    const name = searchParams.get('name') ?? 'collection';
    const image = imageParam
      ? decodeURIComponent(imageParam)
      : `${process.env.NEXT_PUBLIC_BASE_URL}/images/moon.svg`;
    const verified = searchParams.get('verified') ?? 'false';
    const listed = searchParams.get('listed') ?? '0';
    const owners = searchParams.get('owners') ?? '0';
    const floorPrice = searchParams.get('floor') ?? '0';
    const volume = searchParams.get('volume') ?? '0';

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: 'black',
            backgroundSize: '150px 150px',
            height: '100%',
            width: '100%',
            display: 'flex',
            textAlign: 'left',
            justifyContent: 'flex-end',
            flexDirection: 'column',
            flexWrap: 'nowrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              right: '30px',
              top: '30px',
              width: '80px',
              height: '80px',
              background: 'transparent',
            }}
          >
            <img
              alt="nightmarket-logo"
              height={80}
              width={80}
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/moon.svg`}
            />
          </div>
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyItems: 'left',
            }}
          >
            <img alt="Vercel" height={200} src={image} style={{ margin: '0 30px' }} width={200} />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 40,
              width: '100%',
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              color: 'white',
              marginTop: 10,
              padding: '0 30px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              marginBottom: '12px',
            }}
          >
            {name}
            {verified === 'true' && <Icon.Verified />}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              padding: '0 30px',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                color: 'white',
                width: '120px',
              }}
            >
              {parseInt(listed, 10).toLocaleString()}
            </span>
            <span
              style={{
                color: 'white',
                width: '150px',
              }}
            >
              {parseInt(owners, 10).toLocaleString()}
            </span>
            <span
              style={{
                color: 'white',
                width: '180px',
              }}
            >
              {getSolFromLamports(floorPrice, 0, 2)} SOL
            </span>
            <span
              style={{
                color: 'white',
                width: '180px',
              }}
            >
              {getExtendedSolFromLamports(volume)} SOL
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '0 30px',
              fontSize: 20,
              marginBottom: 40,
            }}
          >
            <span
              style={{
                color: '#ccc',
                width: '120px',
              }}
            >
              listed
            </span>
            <span
              style={{
                color: '#ccc',
                width: '150px',
              }}
            >
              owners
            </span>
            <span
              style={{
                color: '#ccc',
                width: '180px',
              }}
            >
              floor price
            </span>
            <span
              style={{
                color: '#ccc',
                width: '180px',
              }}
            >
              24H volume
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

export function getRoundedValue(value: number, round: number): number {
  if (round > 0) {
    let multiplied = Math.round(value * 10 ** round);
    while (multiplied === 0) {
      round += 1;
      multiplied = Math.round(value * 10 ** round);
    }
    return multiplied / 10 ** round;
  }

  return value;
}

export function getSolFromLamports(price: number | string, decimals = 0, round = 0): number {
  let value = Number(price) / 1000000000;
  if (value === 0) {
    return 0;
  }

  if (decimals > 0) {
    value = value / 10 ** decimals;
  }

  return getRoundedValue(value, round);
}

export function getExtendedSolFromLamports(price: string, decimals = 3, round = 2): string {
  const numPrice = Number(price);
  if (numPrice < 1000) {
    return `${getSolFromLamports(price, 0, round)}`;
  } else {
    return `${getSolFromLamports(price, decimals, round)}K`;
  }
}
