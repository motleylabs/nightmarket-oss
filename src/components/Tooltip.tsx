import { ReactNode } from "react"
import clsx from "clsx";
import { usePopperTooltip, PopperOptions } from 'react-popper-tooltip';

//reference - https://www.npmjs.com/package/react-popper-tooltip

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  placement?: PopperOptions["placement"];
}

export default function Tooltip({
  children,
  content,
  className,
  placement
}: TooltipProps) {
  const {
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip({placement});

  return (
    <>
      <div ref={setTriggerRef} className="inline">
        {children}
      </div>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps()}
          className={clsx("bg-gray-700 text-white py-2 px-4 rounded text-sm z-20", className)}
          >
          {content}
        </div>
      )}
    </>
  )
}
