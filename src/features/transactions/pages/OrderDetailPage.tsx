import { Button, Col, Row, Space, Typography, message } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/store/AuthProvider';
import { CreateRefundModal } from '../../refunds/components/CreateRefundModal';
import { useRefunds } from '../../refunds/store/RefundsProvider';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  OrderDetailEmpty,
  OrderSummaryCard,
  OrderTimelineCard,
  RefundRecordCard,
} from '../components/OrderDetailSections';
import { findOrderById, getOrderEvents, getRefundRecords } from '../lib/transaction-utils';

const { Paragraph, Text, Title } = Typography;

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { orders, refunds, orderEvents, createRefund, refundReviewThreshold } = useRefunds();
  const [messageApi, contextHolder] = message.useMessage();

  const order = findOrderById(orders, orderId);

  if (!order) {
    return <OrderDetailEmpty orderId={orderId} onBack={() => navigate('/transactions')} />;
  }

  const canCreateRefund = Boolean(currentUser?.permissions.includes(PERMISSIONS.refundCreate));
  const currentOrderEvents = getOrderEvents(orderEvents, order.id);
  const refundRecords = getRefundRecords(refunds, order.id);

  return (
    <Space direction="vertical" size={16} className="full-width">
      {contextHolder}
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
        {canCreateRefund ? (
          <Button
            type="primary"
            disabled={order.refundableAmount <= 0}
            onClick={() => setRefundModalOpen(true)}
          >
            发起退款
          </Button>
        ) : null}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <OrderSummaryCard order={order} />
        </Col>
        <Col xs={24} xl={10}>
          <OrderTimelineCard events={currentOrderEvents} />
        </Col>
        <Col span={24}>
          <RefundRecordCard refunds={refundRecords} />
        </Col>
      </Row>

      <CreateRefundModal
        open={refundModalOpen}
        orderId={order.id}
        maxRefundableAmount={order.refundableAmount}
        reviewThreshold={refundReviewThreshold}
        onCancel={() => setRefundModalOpen(false)}
        onSubmit={(values) => {
          const result = createRefund({
            orderId: order.id,
            amount: values.amount,
            reason: values.reason,
            remark: values.remark,
            createdBy: currentUser?.name ?? '运营人员',
          });

          if (!result.success) {
            messageApi.error(result.message);
            return;
          }

          messageApi.success(result.message);
          setRefundModalOpen(false);
        }}
      />
    </Space>
  );
}
