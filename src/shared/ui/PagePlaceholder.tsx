import type { ReactNode } from 'react';
import { Card, Space, Tag, Typography } from 'antd';

const { Paragraph, Title } = Typography;

type PagePlaceholderProps = {
  title: string;
  description: string;
  badge?: string;
  extra?: ReactNode;
};

export function PagePlaceholder({ title, description, badge, extra }: PagePlaceholderProps) {
  return (
    <Card className="page-placeholder">
      <Space direction="vertical" size={16}>
        <Space>
          <Title level={3} className="page-placeholder__title">
            {title}
          </Title>
          {badge ? <Tag color="blue">{badge}</Tag> : null}
        </Space>
        <Paragraph type="secondary" className="page-placeholder__description">
          {description}
        </Paragraph>
        {extra}
      </Space>
    </Card>
  );
}

