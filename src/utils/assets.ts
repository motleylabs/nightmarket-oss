export enum AssetSize {
  Original = 0,
  Tiny = 100,
  XSmall = 400,
  Small = 600,
  Medium = 800,
  Large = 1400,
}

const VALID_IMAGE_SIZES = [
  AssetSize.Original,
  AssetSize.Tiny,
  AssetSize.XSmall,
  AssetSize.Small,
  AssetSize.Medium,
  AssetSize.Large,
];

const ASSET_BASE = 'https://assets.nightmarket.io/';

export function getAssetURL(url: string | undefined, size: AssetSize): string {
  if (!url) {
    return '';
  }

  const encoded = encodeURIComponent(url);
  const validSize = VALID_IMAGE_SIZES.indexOf(size) > -1 ? size : 0;
  return `${ASSET_BASE}?url=${encoded}&width=${validSize}`;
}
