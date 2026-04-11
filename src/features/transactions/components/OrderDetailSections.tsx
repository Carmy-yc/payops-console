import { Button, Card, Descriptions, Result, Space, Table, Tag, Timeline, Typography } from 'antd';
import { formatAmount, formatDateTime } from '../lib/transaction-utils';
import type { OrderEvent, RefundRecord, TransactionOrder } from '../types';
import {
  ChannelTag,
  RefundStatusTag,
  ReviewStatusTag,
  RiskLevelTag,
  TransactionStatusTag,
} from './TransactionTags';

const { Paragraph, Text, Title } = Typography;

export function OrderSummaryCard({ order }: { order: TransactionOrder }) {
  return (
    <Card title="订单概览">
      <Descriptions column={2} size="small">
        <Descriptions.Item label="订单号">{order.id}</Descriptions.Item>
        <Descriptions.Item label="商户名称">{order.merchantName}</Descriptions.Item>
        <Descriptions.Item label="用户 ID">{order.userId}</Descriptions.Item>
        <Descriptions.Item label="交易标题">{order.subject}</Descriptions.Item>
        <Descriptions.Item label="订单金额">{formatAmount(order.amount)}</Descriptions.Item>
        <Descriptions.Item label="可退款金额">
          {formatAmount(order.refundableAmount)}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">{formatDateTime(order.createdAt)}</Descriptions.Item>
        <Descriptions.Item label="支付时间">{formatDateTime(order.paidAt)}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{formatDateTime(order.updatedAt)}</Descriptions.Item>
        <Descriptions.Item label="支付渠道">
          <ChannelTag channel={order.payChannel} />
        </Descriptions.Item>
      </Descriptions>

      <div className="order-summary__tags">
        <TransactionStatusTag status={order.status} />
        <RiskLevelTag riskLevel={order.riskLevel} />
        {order.hasRiskAlert ? <Tag color="red">已命中风控告警</Tag> : <Tag>无风控告警</Tag>}
      </div>
    </Card>
  );
}

export function OrderTimelineCard({ events }: { events: OrderEvent[] }) {
  return (
    <Card title="订单时间线">
      <Timeline
        items={events.map((event) => ({
          children: (
            <div className="order-timeline__content">
              <Title level={5} className="order-timeline__title">
                {event.title}
              </Title>
              <Paragraph type="secondary" className="order-timeline__description">
                {event.description}
              </Paragraph>
              <Text type="secondary">
                {event.operator} · {formatDateTime(event.createdAt)}
              </Text>
            </div>
          ),
        }))}
      />
    </Card>
  );
}

export function RefundRecordCard({ refunds }: { refunds: RefundRecord[] }) {
  const columns = [
    {
      title: '退款单号',
      dataIndex: 'id',
      key: 'id',
      width: 160,
    },
    {
      title: '退款金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value: number) => formatAmount(value),
    },
    {
      title: '退款原因',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '退款状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: RefundRecord['status']) => <RefundStatusTag status={value} />,
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      key: 'reviewStatus',
      width: 120,
      render: (value: RefundRecord['reviewStatus']) => <ReviewStatusTag status={value} />,
    },
    {
      title: '发起时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
  ];

  return (
    <Card title="关联退款记录">
      <Table<RefundRecord>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={refunds}
        pagination={false}
        locale={{
          emptyText: '当前订单暂无退款记录',
        }}
      />
    </Card>
  );
}

export function OrderDetailEmpty({
  orderId,
  onBack,
}: {
  orderId?: string;
  onBack: () => void;
}) {
  return (
    <Card>
      <Result
        status="404"
        title="订单不存在"
        subTitle={orderId ? `未找到订单 ${orderId}，请返回交易列表重新选择。` : '缺少订单编号。'}
        extra={
          <Space>
            <Button type="primary" onClick={onBack}>
              返回交易列表
            </Button>
          </Space>
        }
      />
    </Card>
  );
}

