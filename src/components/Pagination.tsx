import clsx from 'clsx';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import Icon from './Icon';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setItemsPerPage: Dispatch<SetStateAction<number>>;
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  setItemsPerPage,
}: PaginationProps) {
  const { t } = useTranslation('common');
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handlePrevPage = () => {
    if (setCurrentPage) setCurrentPage(Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    if (setCurrentPage) setCurrentPage(Math.min(currentPage + 1, totalPages));
  };
  const handlePageClick = (pageNumber: number) => {
    if (setCurrentPage) setCurrentPage(pageNumber);
  };

  const pages = useMemo(() => {
    const pageArray = pagination(currentPage, totalPages);

    return (
      <div className="mb-5 flex w-full justify-center md:absolute">
        <ArrowStyle
          onClick={() => {
            if (currentPage !== 1) handlePrevPage();
          }}
        >
          <span>
            <Icon.SimpleArrow className="rotate-180" />
          </span>
        </ArrowStyle>
        <div className="mx-5 flex">
          {pageArray.map((page, key) => {
            if (isNaN(+page))
              return (
                <div
                  key={`page-noclick-${key}`}
                  className="mx-4 mb-1 flex h-10 w-10 items-end justify-end text-gray-600 md:h-8 md:w-8"
                >
                  {page}
                </div>
              );

            return (
              <button
                key={`page-${key}`}
                onClick={() => {
                  if (page !== currentPage) handlePageClick(+page);
                }}
                className={clsx(
                  'mr-2 flex h-10 w-10 items-center justify-center rounded-full text-gray-200 hover:bg-[#27262E] md:h-8 md:w-8',
                  {
                    'bg-[#27262E]': page === currentPage,
                  }
                )}
              >
                <span className={clsx(page === currentPage ? 'text-white' : 'text-gray-200')}>
                  {page}
                </span>
              </button>
            );
          })}
        </div>
        <ArrowStyle
          onClick={() => {
            if (currentPage !== totalPages) handleNextPage();
          }}
        >
          <span>
            <Icon.SimpleArrow />
          </span>
        </ArrowStyle>
      </div>
    );
  }, [currentPage, totalPages]);

  if (totalPages === 1) return null;

  return (
    <div className="relative mt-5 w-full px-6">
      <div className="">{pages}</div>
      <div className="flex justify-between">
        <div className="flex items-center">
          <p className="mr-2 text-sm font-semibold text-gray-500">
            {t('pagination.totalItems', { ns: 'common' })}
          </p>
          <div className="flex h-10 w-14 items-center justify-center rounded-full bg-gray-800 text-gray-200">
            {totalItems}
          </div>
        </div>

        <div className="flex items-center">
          <p className="mr-2 text-sm font-semibold text-gray-500">
            {t('pagination.itemsPerPage', { ns: 'common' })}
          </p>
          <div className="flex h-10 w-14 items-center justify-center rounded-full bg-gray-800 text-gray-200">
            {itemsPerPage}

            {/* <Icon.SimpleArrow className="-mr-2 rotate-90 stroke-white" /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function pagination(currentPage: number, lastPage: number) {
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta + 1;
  const range = [];
  const rangeWithDots = [];

  for (let page = 1; page <= lastPage; page++) {
    if (page == 1 || page == lastPage || (page >= left && page < right)) {
      range.push(page);
    }
  }

  let lastindex;
  for (let page of range) {
    if (lastindex) {
      if (page - lastindex === 2) {
        rangeWithDots.push(lastindex + 1);
      } else if (page - lastindex !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(page);
    lastindex = page;
  }

  return rangeWithDots;
}

function ArrowStyle({
  onClick,
  children,
  className = '',
}: {
  className?: string;
  children: JSX.Element[] | JSX.Element;
  onClick: () => void;
}) {
  return (
    <button className={clsx('h-10 w-10 text-white md:h-8 md:w-8', className)} onClick={onClick}>
      {children}
    </button>
  );
}
