import clsx from 'clsx';

export enum FontWeight {
  Semibold = 'font-semibold',
}

export enum TextColor {
  Orange = 'text-orange-700',
  Gray = 'text-gray-300',
}

interface ParagraphProps {
  weight?: FontWeight;
  color?: TextColor;
  children: string | JSX.Element | JSX.Element[];
  className?: string;
}

export function Paragraph({ weight, color, children, className }: ParagraphProps): JSX.Element {
  return <p className={clsx(weight, color, className)}>{children}</p>;
}
