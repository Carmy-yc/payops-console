import type { ReactNode } from 'react';
import { Card, Col, Form, Space, Typography } from 'antd';

const { Text } = Typography;

type FilterPanelProps = {
  children: ReactNode;
  className?: string;
  extra?: ReactNode;
  title?: ReactNode;
};

type FilterPanelActionsProps = {
  align?: 'start' | 'end';
  children: ReactNode;
  span: number;
};

export function FilterPanel({
  children,
  className,
  extra,
  title = '筛选条件',
}: FilterPanelProps) {
  const titleNode = typeof title === 'string' ? <Text strong>{title}</Text> : title;

  return (
    <Card className={className}>
      <Space direction="vertical" size={16} className="full-width">
        <div className="filter-panel__header">
          {titleNode}
          {extra ? <div className="filter-panel__extra">{extra}</div> : null}
        </div>
        {children}
      </Space>
    </Card>
  );
}

export function FilterPanelActions({
  align = 'end',
  children,
  span,
}: FilterPanelActionsProps) {
  return (
    <Col span={span} className={`filter-panel__actions filter-panel__actions--${align}`}>
      <Form.Item label=" " className={`filter-panel__action-item filter-panel__action-item--${align}`}>
        {children}
      </Form.Item>
    </Col>
  );
}
