import { Button, Col, Row, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  OrderDetailEmpty,
  OrderSummaryCard,
  OrderTimelineCard,
  RefundRecordCard,
} from '../components/OrderDetailSections';
import { mockOrderEvents } from '../data/mock-order-events';
import { mockOrders } from '../data/mock-orders';
import { mockRefunds } from '../data/mock-refunds';
import { findOrderById, getOrderEvents, getRefundRecords } from '../lib/transaction-utils';

const { Paragraph, Text, Title } = Typography;

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = findOrderById(mockOrders, orderId);

  if (!order) {
    return <OrderDetailEmpty orderId={orderId} onBack={() => navigate('/transactions')} />;
  }

  const orderEvents = getOrderEvents(mockOrderEvents, order.id);
  const refundRecords = getRefundRecords(mockRefunds, order.id);

  return (
    <Space direction="vertical" size={16} className="full-width">
      <div className="order-detail__header">
        <div>
          <Space size={12}>
            <Button onClick={() => navigate('/transactions')}>返回交易列表</Button>
            <Text type="secondary">订单编号：{order.id}</Text>
          </Space>
          <Title level={3} className="order-detail__title">
            订单详情
          </Title>
          <Paragraph type="secondary">
            这里聚合了订单的基础信息、状态标签、时间线和关联退款记录，后续可以在这个页面继续接退款发起流程。
          </Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <OrderSummaryCard order={order} />
        </Col>
        <Col xs={24} xl={10}>
          <OrderTimelineCard events={orderEvents} />
        </Col>
        <Col span={24}>
          <RefundRecordCard refunds={refundRecords} />
        </Col>
      </Row>
    </Space>
  );
}

