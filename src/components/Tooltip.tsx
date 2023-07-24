import clsx from 'clsx';
import { ReactNode } from 'react';
import { usePopperTooltip, PopperOptions } from 'react-popper-tooltip';

//reference - https://www.npmjs.com/package/react-popper-tooltip

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  placement?: PopperOptions['placement'];
  wrapperClass?: string;
  title?: string;
}

export default function Tooltip({
  children,
  title,
  content,
  className,
  placement,
  wrapperClass,
}: TooltipProps) {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({
    placement,
  });

  return (
    <>
      <div ref={setTriggerRef} className={clsx('inline', wrapperClass)}>
        {children}
      </div>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps()}
          className={clsx('bg-gray-700 text-white py-2 px-4 rounded text-sm z-20', className)}
        >
          {!!title && <div className={clsx('text-white mb-1')}> {title} </div>}
          {content}
        </div>
      )}
    </>
  );
}
