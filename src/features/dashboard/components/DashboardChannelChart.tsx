import { Typography } from 'antd';
import { formatAmount } from '../../transactions/lib/transaction-utils';
import type { DashboardChannelStat } from '../lib/dashboard-utils';

const { Text } = Typography;

type DashboardChannelChartProps = {
  data: DashboardChannelStat[];
  totalAmount: number;
};

function buildChannelGradient(data: DashboardChannelStat[]) {
  if (data.length === 0) {
    return 'conic-gradient(#d9d9d9 0deg 360deg)';
  }

  let currentAngle = 0;
  const segments = data.map((item) => {
    const start = currentAngle;
    currentAngle += item.percent * 3.6;
    return `${item.color} ${start}deg ${currentAngle}deg`;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

export function DashboardChannelChart({ data, totalAmount }: DashboardChannelChartProps) {
  return (
    <div className="dashboard-chart dashboard-chart--channel">
      <div className="dashboard-channel-chart__donut-wrap">
        <div
          className="dashboard-channel-chart__donut"
          style={{ background: buildChannelGradient(data) }}
        >
          <div className="dashboard-channel-chart__center">
            <Text type="secondary">今日成功交易额</Text>
            <Text strong>{formatAmount(totalAmount)}</Text>
          </div>
        </div>
      </div>

      <div className="dashboard-chart__legend">
        {data.map((item) => (
          <div key={item.channel} className="dashboard-channel-chart__legend-item">
            <div className="dashboard-channel-chart__legend-main">
              <span
                className="dashboard-channel-chart__swatch"
                style={{ backgroundColor: item.color }}
              />
              <Text strong>{item.label}</Text>
              <Text type="secondary">{item.percent.toFixed(1)}%</Text>
            </div>
            <Text type="secondary">
              {formatAmount(item.amount)} / {item.count} 笔
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
