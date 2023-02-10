import clsx from 'clsx';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import config from '../app.config';
import { Wallet } from '../graphql.types';
import { ReferredData, useBuddyHistory } from '../hooks/referrals';
import Icon from './Icon';

interface Sorter {
  label?: string;
  direction?: 'asc' | 'desc';
}

interface CompareFn<T> {
  (a: T, b: T): number;
}

interface TableColumn<T> {
  label: string;
  //   compare: CompareFn<T>;
}

interface TableMetadata {
  data: any[];
  columns: TableColumn<any>[];
}

interface TableProps {
  metadata: TableMetadata;
}

export function Table({ metadata }: TableProps): JSX.Element {
  // const [sorter, setSorter] = useState<Sorter>({});

  const labels = useMemo(() => {
    return metadata.columns.map((col, key) => {
      return (
        <div key={`col-${key}`}>
          <div className="font-bold text-gray-500">{col.label}</div>
          {/* <div>add arrows once sorting is implemented</div> */}
        </div>
      );
    });
  }, [metadata.columns]);

  const items = useMemo(() => {
    return metadata.data.map((item, itemKey) => {
      return (
        <div className="grid grid-cols-auto rounded-xl bg-gray-800 p-4" key={`item-${itemKey}`}>
          {metadata.columns.map((col, colKey) => {
            return (
              <div className="font-bold text-gray-200" key={`item-${itemKey}-${colKey}`}>
                {item[col.label] ? item[col.label] : null}
              </div>
            );
          })}
        </div>
      );
    });
  }, [metadata.data]);

  return (
    <div className="grid gap-y-2">
      <div className="grid grid-cols-auto">{labels}</div>
      {items}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={clsx('over flex animate-pulse rounded-md p-2 transition', className)}>
      <div className=" h-14 w-full rounded-md bg-gray-800 p-4" />
    </div>
  );
}

Table.Skeleton = Skeleton;

interface ClaimHistoryProps {
  wallet: Wallet;
}

export const FILTER_HISTORY = ['ClaimSol'];
function ClaimHistory({ wallet }: ClaimHistoryProps) {
  const { t } = useTranslation('referrals');
  const [metadata, setMetadata] = useState<TableMetadata>({
    data: [],
    columns: [],
  });
  const { data, loading } = useBuddyHistory({
    wallet: wallet.address,
    organisation: config.buddylink.organizationName,
  });

  useEffect(() => {
    if (data) {
      setMetadata({
        data: data
          .filter((tx) => FILTER_HISTORY.includes(tx.instruction))
          .map((tx) => ({
            Date: format(new Date(tx.blocktime * 1000), 'dd.MM.yy'),
            Amount: (
              <div className="flex items-center">
                <div className="mr-1">
                  <Icon.Sol />
                </div>
                <div>{Math.abs(tx.amount) / 1e9}</div>
              </div>
            ),
          })),
        columns: [{ label: 'Date' }, { label: 'Amount' }],
      });
    }
  }, [data]);

  return loading ? (
    <>
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
    </>
  ) : metadata.data.length > 0 ? (
    <Table metadata={metadata} />
  ) : (
    <p className="text-gray-300">{t('profile.noClaimHistory', { ns: 'referrals' })}</p>
  );
}

Table.ClaimHistory = ClaimHistory;

interface ReferredListProps {
  referred?: ReferredData[];
  loading: boolean;
}

function ReferredList({ referred, loading }: ReferredListProps) {
  const { t } = useTranslation('referrals');
  const [metadata, setMetadata] = useState<TableMetadata>({
    data: [],
    columns: [],
  });

  useEffect(() => {
    if (referred) {
      setMetadata({
        data: referred.map((ref) => ({
          Address: ellipsize(ref.userWallet),
          Date: format(new Date(ref.dateCreated * 1000), 'dd.MM.yy'),
          ['Total Generated Volume']: (
            <div className="flex items-center">
              <div className="mr-1">
                <Icon.Sol />
              </div>
              <div>{(ref.totalGeneratedFeeVolume || 0) / 1e9}</div>
            </div>
          ),
        })),
        columns: [{ label: 'Address' }, { label: 'Date' }, { label: 'Total Generated Volume' }],
      });
    }
  }, [referred]);

  return loading ? (
    <>
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
    </>
  ) : metadata.data.length > 0 ? (
    <Table metadata={metadata} />
  ) : (
    <p className="text-gray-300">{t('profile.noReferred', { ns: 'referrals' })}</p>
  );
}

Table.ReferredList = ReferredList;

function Inactive() {
  return null;
}

Table.Inactive = Inactive;

function ellipsize(pubKey: string) {
  return `${pubKey.substring(0, 4)}...${pubKey.substring(pubKey.length - 4, pubKey.length)}`;
}
