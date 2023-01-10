import { useMemo } from 'react';

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
    return metadata.columns.map((col) => {
      return (
        <div>
          <div className="font-bold text-gray-500">{col.label}</div>
          {/* <div>add arrows once sorting is implemented</div> */}
        </div>
      );
    });
  }, [metadata.columns]);

  const items = useMemo(() => {
    return metadata.data.map((item) => {
      return (
        <div className="grid grid-cols-auto rounded-xl bg-gray-800 p-4">
          {metadata.columns.map((col) => {
            return (
              <div className="font-bold text-gray-200">
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
