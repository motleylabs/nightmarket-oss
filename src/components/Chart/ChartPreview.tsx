import clsx from 'clsx';
import type { ReactNode } from 'react';

export function ChartPreview({
  title,
  dateRange,
  chart,
  className,
  min,
  max,
}: {
  title: string;
  dateRange: string;
  chart: ReactNode;
  className?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className={clsx('flex flex-col gap-1 rounded-xl bg-gray-800 py-6 w-1/2')}>
      <div className="flex items-center justify-between px-6">
        <h2 className="text-sm text-gray-300">{title}</h2>
        <h2 className="text-sm text-gray-300">{dateRange}</h2>
      </div>
      <div className="relative">
        {!!max && (
          <div className="absolute left-6 top-0 h-full">
            <span className="text-sm text-gray-300">{max}</span>
          </div>
        )}
        <div className={clsx('pt-7 pb-3', className)}>{chart}</div>
        {!!min && (
          <div className="absolute right-6 top-[90%] h-full">
            <span className="text-sm text-gray-300">{min}</span>
          </div>
        )}
      </div>
    </div>
  );
}
