import dynamic from 'next/dynamic';
import type { TooltipProps } from 'recharts';

export const CustomLineChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${payload[0].value}`}</p>
      </div>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
};

export function Chart() {
  return <div />;
}

const DynamicStyledLineChart = dynamic(
  () => import('./StyledLineChart').then((mod) => mod.StyledLineChart),
  {
    ssr: false,
  }
);
const DynamicTinyLineChart = dynamic(
  () => import('./TinyLineChart').then((mod) => mod.TinyLineChart),
  {
    ssr: false,
  }
);
const DynamicStyledBarChart = dynamic(
  () => import('./StyledBarChart').then((mod) => mod.StyledBarChart),
  {
    ssr: false,
  }
);
const DynamicChartTimeseries = dynamic(
  () => import('./ChartTimeseries').then((mod) => mod.ChartTimeseries),
  {
    ssr: false,
  }
);
const DynamicChartPreview = dynamic(
  () => import('./ChartPreview').then((mod) => mod.ChartPreview),
  {
    ssr: false,
  }
);

Chart.LineChart = DynamicStyledLineChart;
Chart.TinyLineChart = DynamicTinyLineChart;
Chart.BarChart = DynamicStyledBarChart;
Chart.Timeseries = DynamicChartTimeseries;
Chart.Preview = DynamicChartPreview;
