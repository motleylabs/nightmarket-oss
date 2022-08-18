
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSidePropsContext } from "next";
import client from './../../../client'
import { NftQuery } from './../../../queries/nft.graphql';
import { Nft } from "../../../types";
import { ReactNode } from "react";
import NftLayout from "../../../layouts/NftLayout";

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'nft']);

  const {
    data: { nft },
  } = await client.query({
    query: NftQuery,
    variables: {
      address: params?.address,
    },
  });

  if (nft === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      nft,
      ...i18n,
    },
  };
}

interface NftDetailPageProps {
  nft: Nft;
}

export default function NftDetails({ nft }: NftDetailPageProps) {
  return (
    <div>

    </div>
  )
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
}

NftDetails.getLayout = function NftDetailsLayout({
  children,
  nft,
}: NftDetailsLayoutProps): JSX.Element {
  return <NftLayout nft={nft}>{children}</NftLayout>;
};