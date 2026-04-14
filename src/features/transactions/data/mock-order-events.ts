import { mockOrders } from './mock-orders';
import { mockRefunds } from './mock-refunds';
import type { OrderEvent } from '../types';

function buildEvent(
  orderId: string,
  suffix: string,
  title: string,
  description: string,
  operator: string,
  createdAt: string,
  eventType: OrderEvent['eventType'],
): OrderEvent {
  return {
    id: `${orderId}-${suffix}`,
    orderId,
    title,
    description,
    operator,
    createdAt,
    eventType,
  };
}

export const mockOrderEvents: OrderEvent[] = mockOrders.flatMap((order) => {
  const events: OrderEvent[] = [
    buildEvent(
      order.id,
      'created',
      '订单创建',
      `${order.merchantName} 发起了 ${order.subject} 的支付请求。`,
      '系统',
      order.createdAt,
      'order_created',
    ),
  ];

  if (order.paidAt) {
    events.push(
      buildEvent(
        order.id,
        'paid',
        '支付成功',
        `订单通过 ${order.payChannel} 完成支付。`,
        '支付网关',
        order.paidAt,
        'payment_success',
      ),
    );
  }

  if (order.status === 'failed') {
    events.push(
      buildEvent(
        order.id,
        'failed',
        '支付失败',
        '渠道返回失败结果，订单未完成支付。',
        '支付网关',
        order.updatedAt,
        'payment_failed',
      ),
    );
  }

  if (order.status === 'closed') {
    events.push(
      buildEvent(
        order.id,
        'closed',
        '订单关闭',
        '订单超时未支付，系统自动关闭。',
        '系统',
        order.updatedAt,
        'order_closed',
      ),
    );
  }

  if (order.hasRiskAlert) {
    events.push(
      buildEvent(
        order.id,
        'risk',
        '命中风险规则',
        '风控规则标记该订单存在异常支付风险。',
        '风控系统',
        order.updatedAt,
        'risk_flagged',
      ),
    );
  }

  const orderRefunds = mockRefunds.filter((refund) => refund.orderId === order.id);

  orderRefunds.forEach((refund) => {
    events.push(
      buildEvent(
        order.id,
        `refund-created-${refund.id}`,
        '发起退款',
        `发起退款 ${refund.id}，原因：${refund.reason}。`,
        '陈晓彤',
        refund.createdAt,
        'refund_created',
      ),
    );

    if (refund.reviewStatus === 'approved') {
      events.push(
        buildEvent(
          order.id,
          `refund-approved-${refund.id}`,
          '退款审核通过',
          `退款 ${refund.id} 已通过财务审核。`,
          '周雅宁',
          refund.createdAt,
          'refund_approved',
        ),
      );
    }

    if (refund.status === 'success') {
      events.push(
        buildEvent(
          order.id,
          `refund-success-${refund.id}`,
          '退款成功',
          `退款 ${refund.id} 已退回至原支付渠道。`,
          '支付网关',
          refund.createdAt,
          'refund_success',
        ),
      );
    }

    if (refund.status === 'rejected') {
      events.push(
        buildEvent(
          order.id,
          `refund-rejected-${refund.id}`,
          '退款驳回',
          `退款 ${refund.id} 已被驳回。`,
          '周雅宁',
          refund.createdAt,
          'refund_rejected',
        ),
      );
    }
  });

  return events.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
});
