import { Card, Col, Row, Statistic } from 'antd';
import type { AuditLogSummary } from '../types';

type AuditLogStatsProps = {
  summary: AuditLogSummary;
};

export function AuditLogStats({ summary }: AuditLogStatsProps) {
  const stats = [
    { title: '总日志数', value: summary.totalCount, suffix: '条' },
    { title: '成功操作', value: summary.successCount, suffix: '条' },
    { title: '失败操作', value: summary.failedCount, suffix: '条' },
    { title: '覆盖模块', value: summary.moduleCount, suffix: '个' },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((item) => (
        <Col key={item.title} xs={24} md={12} xl={6}>
          <Card>
            <Statistic title={item.title} value={item.value} suffix={item.suffix} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
