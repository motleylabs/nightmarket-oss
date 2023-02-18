import clsx from 'clsx';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import config from '../app.config';
import { Wallet } from '../graphql.types';
import { ReferredData, useBuddyHistory } from '../hooks/referrals';
import Icon from './Icon';
import { Pagination } from './Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const labels = useMemo(() => {
    return (
      <tr>
        {metadata.columns.map((col, key) => {
          return (
            <th
              key={`col-${key}`}
              className="text-left font-normal text-gray-500 first:py-4 first:pl-4"
            >
              <div>{col.label}</div>
            </th>
          );
        })}
      </tr>
    );
  }, [metadata.columns]);

  const items = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = metadata.data.slice(startIndex, endIndex);

    return paginatedItems.map((item, itemKey) => {
      return (
        <tr className="rounded-xl bg-gray-800 p-4" key={`item-${itemKey}`}>
          {metadata.columns.map((col, colKey) => {
            return (
              <td
                className="min-w-[150px] font-bold text-gray-200 first:rounded-tl-xl first:rounded-bl-xl first:py-4 first:pl-4 last:rounded-tr-xl last:rounded-br-xl"
                key={`item-${itemKey}-${colKey}`}
              >
                {item[col.label] ? item[col.label] : null}
              </td>
            );
          })}
        </tr>
      );
    });
  }, [metadata.data, currentPage, itemsPerPage]);

  return (
    <>
      <div className="overflow-x-auto px-6 lg:px-0">
        <table className="w-full table-auto border-separate border-spacing-y-2">
          <thead>{labels}</thead>
          <tbody className="pt-3">{items}</tbody>
        </table>
      </div>
      <Pagination
        totalItems={metadata.data?.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </>
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
            Status: 'Succeed',
          })),
        columns: [{ label: 'Date' }, { label: 'Amount' }, { label: 'Status' }],
      });
    }
  }, [data]);

  return loading ? (
    <div className="mt-11  px-6">
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
    </div>
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
          [t('table.address', { ns: 'referrals' })]: ellipsize(ref.userWallet),
          [t('table.date', { ns: 'referrals' })]: format(
            new Date(ref.dateCreated * 1000),
            'dd.MM.yy'
          ),
          [t('table.feeGenerated', { ns: 'referrals' })]: (
            <div className="flex items-center">
              <div className="mr-1">
                <Icon.Sol />
              </div>
              <div>{(ref.totalGeneratedFeeVolume || 0) / 1e9}</div>
            </div>
          ),
          [t('table.volume', { ns: 'referrals' })]: (
            <div className="flex items-center">
              <div className="mr-1">
                <Icon.Sol />
              </div>
              <div>{(ref.totalGeneratedMarketplaceVolume || 0) / 1e9}</div>
            </div>
          ),
        })),
        columns: [
          { label: t('table.date', { ns: 'referrals' }) },
          { label: t('table.address', { ns: 'referrals' }) },
          { label: t('table.feeGenerated', { ns: 'referrals' }) },
          { label: t('table.volume', { ns: 'referrals' }) },
        ],
      });
    }
  }, [referred]);

  return loading ? (
    <div className="mt-11 px-6 lg:px-0">
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
      <Table.Skeleton />
    </div>
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
