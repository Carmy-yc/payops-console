import { Typography } from 'antd';
import type { DashboardIssueStat } from '../lib/dashboard-utils';

const { Text } = Typography;

type DashboardIssueChartProps = {
  data: DashboardIssueStat[];
};

export function DashboardIssueChart({ data }: DashboardIssueChartProps) {
  const maxValue = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="dashboard-chart dashboard-chart--issue">
      {data.map((item) => (
        <div key={item.key} className="dashboard-issue-chart__row">
          <div className="dashboard-issue-chart__header">
            <Text strong>{item.label}</Text>
            <Text type="secondary">{item.count} 项</Text>
          </div>
          <div className="dashboard-issue-chart__bar-track">
            <div
              className="dashboard-issue-chart__bar-fill"
              style={{
                width: `${(item.count / maxValue) * 100}%`,
                background: item.color,
              }}
            />
          </div>
          <Text type="secondary">{item.description}</Text>
        </div>
      ))}
    </div>
  );
}
