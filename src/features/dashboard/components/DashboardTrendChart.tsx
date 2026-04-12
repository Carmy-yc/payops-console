import { Typography } from 'antd';
import { formatAmount } from '../../transactions/lib/transaction-utils';
import type { DashboardTrendPoint } from '../lib/dashboard-utils';

const { Text } = Typography;

type DashboardTrendChartProps = {
  data: DashboardTrendPoint[];
};

const svgWidth = 640;
const svgHeight = 220;
const leftPadding = 16;
const rightPadding = 16;
const topPadding = 20;
const bottomPadding = 32;

function buildAreaPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return '';
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const chartBottom = svgHeight - bottomPadding;
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return `${linePath} L ${lastPoint.x} ${chartBottom} L ${firstPoint.x} ${chartBottom} Z`;
}

export function DashboardTrendChart({ data }: DashboardTrendChartProps) {
  const maxValue = Math.max(...data.map((item) => item.grossAmount), 1);
  const usableWidth = svgWidth - leftPadding - rightPadding;
  const usableHeight = svgHeight - topPadding - bottomPadding;

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? svgWidth / 2
        : leftPadding + (usableWidth / (data.length - 1)) * index;
    const y = topPadding + ((maxValue - item.grossAmount) / maxValue) * usableHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const areaPath = buildAreaPath(points);
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="dashboard-chart dashboard-chart--trend">
      <div className="dashboard-chart__surface">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="dashboard-trend-chart">
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = topPadding + usableHeight * step;
            return (
              <line
                key={step}
                x1={leftPadding}
                y1={y}
                x2={svgWidth - rightPadding}
                y2={y}
                className="dashboard-trend-chart__grid"
              />
            );
          })}

          <path d={areaPath} className="dashboard-trend-chart__area" />
          <path d={linePath} className="dashboard-trend-chart__line" />

          {points.map((point) => (
            <g key={point.date}>
              <circle cx={point.x} cy={point.y} r="4" className="dashboard-trend-chart__dot" />
              <circle
                cx={point.x}
                cy={point.y}
                r="10"
                className="dashboard-trend-chart__dot-shadow"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="dashboard-chart__legend dashboard-chart__legend--trend">
        {data.map((item) => (
          <div key={item.date} className="dashboard-trend-chart__legend-item">
            <Text strong>{item.label}</Text>
            <Text type="secondary">{formatAmount(item.grossAmount)}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
