import type { ReactNode } from 'react';
import { Card, Col, Row, Statistic } from 'antd';

type StatsRowItem = {
  key?: string;
  md?: number;
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  title: ReactNode;
  value: number | string;
  xl?: number;
  xs?: number;
};

type StatsRowProps = {
  items: StatsRowItem[];
  md?: number;
  xl?: number;
  xs?: number;
};

export function StatsRow({ items, md = 12, xl = 6, xs = 24 }: StatsRowProps) {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item, index) => {
        const key = item.key ?? (typeof item.title === 'string' ? item.title : `stat-${index}`);
        const isNumeric = typeof item.value === 'number';

        return (
          <Col key={key} xs={item.xs ?? xs} md={item.md ?? md} xl={item.xl ?? xl}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                suffix={item.suffix}
                prefix={item.prefix}
                precision={isNumeric ? item.precision ?? 0 : undefined}
              />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
