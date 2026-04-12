import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { mockOrderEvents } from '../../transactions/data/mock-order-events';
import { mockOrders } from '../../transactions/data/mock-orders';
import { mockRefunds } from '../../transactions/data/mock-refunds';
import type { OrderEvent, RefundRecord, TransactionOrder } from '../../transactions/types';

const REFUND_REVIEW_THRESHOLD = 500;

type CreateRefundPayload = {
  orderId: string;
  amount: number;
  reason: string;
  remark?: string;
  createdBy: string;
};

type RefundActionResult = {
  success: boolean;
  message: string;
  refund?: RefundRecord;
};

type RefundsContextValue = {
  orders: TransactionOrder[];
  refunds: RefundRecord[];
  orderEvents: OrderEvent[];
  refundReviewThreshold: number;
  createRefund: (payload: CreateRefundPayload) => RefundActionResult;
  approveRefund: (refundId: string, reviewedBy: string) => RefundActionResult;
  rejectRefund: (refundId: string, reviewedBy: string) => RefundActionResult;
  markRefundSuccess: (refundId: string, operator: string) => RefundActionResult;
};

const RefundsContext = createContext<RefundsContextValue | null>(null);

function nowIsoString() {
  return new Date().toISOString();
}

function formatId(sequence: number) {
  return `RF${new Date().toISOString().slice(0, 10).replaceAll('-', '')}${String(sequence).padStart(4, '0')}`;
}

function buildRuntimeEvent(
  refund: RefundRecord,
  title: string,
  description: string,
  operator: string,
  eventType: OrderEvent['eventType'],
): OrderEvent {
  return {
    id: `${refund.id}-${eventType}-${Date.now()}`,
    orderId: refund.orderId,
    title,
    description,
    operator,
    createdAt: nowIsoString(),
    eventType,
  };
}

function deriveOrders(orders: TransactionOrder[], refunds: RefundRecord[]) {
  return orders.map((order) => {
    const runtimeRefunds = refunds.filter(
      (refund) =>
        refund.orderId === order.id &&
        refund.source === 'runtime' &&
        refund.status !== 'rejected' &&
        refund.status !== 'failed',
    );

    const reservedAmount = runtimeRefunds.reduce((sum, refund) => sum + refund.amount, 0);
    const refundableAmount = Math.max(order.refundableAmount - reservedAmount, 0);

    let status = order.status;

    if (runtimeRefunds.length > 0 && refundableAmount === 0) {
      status = 'refunded';
    } else if (runtimeRefunds.length > 0) {
      status = 'refunding';
    }

    return {
      ...order,
      refundableAmount,
      status,
      updatedAt:
        runtimeRefunds.length > 0
          ? runtimeRefunds.reduce(
              (latest, refund) => (refund.createdAt > latest ? refund.createdAt : latest),
              order.updatedAt,
            )
          : order.updatedAt,
    };
  });
}

function seedRefunds(): RefundRecord[] {
  return mockRefunds.map((refund) => ({
    ...refund,
    createdBy: refund.createdBy ?? '运营人员',
    source: 'seed',
  }));
}

export function RefundsProvider({ children }: PropsWithChildren) {
  const { addLog } = useAudit();
  const [refunds, setRefunds] = useState<RefundRecord[]>(() => seedRefunds());
  const [runtimeEvents, setRuntimeEvents] = useState<OrderEvent[]>([]);

  const orders = useMemo(() => deriveOrders(mockOrders, refunds), [refunds]);
  const orderEvents = useMemo(() => [...mockOrderEvents, ...runtimeEvents], [runtimeEvents]);

  const value = useMemo<RefundsContextValue>(
    () => ({
      orders,
      refunds,
      orderEvents,
      refundReviewThreshold: REFUND_REVIEW_THRESHOLD,
      createRefund(payload) {
        const order = orders.find((item) => item.id === payload.orderId);

        if (!order) {
          return { success: false, message: '订单不存在，无法发起退款。' };
        }

        if (payload.amount <= 0) {
          return { success: false, message: '退款金额必须大于 0。' };
        }

        if (payload.amount > order.refundableAmount) {
          return { success: false, message: '退款金额不能超过当前可退款金额。' };
        }

        const reviewRequired = payload.amount >= REFUND_REVIEW_THRESHOLD;
        const refund: RefundRecord = {
          id: formatId(refunds.length + 1),
          orderId: payload.orderId,
          amount: payload.amount,
          reason: payload.reason,
          remark: payload.remark,
          status: reviewRequired ? 'pending' : 'processing',
          reviewStatus: reviewRequired ? 'pending' : 'not_required',
          createdBy: payload.createdBy,
          createdAt: nowIsoString(),
          source: 'runtime',
        };

        setRefunds((previous) => [refund, ...previous]);
        setRuntimeEvents((previous) => [
          ...previous,
          buildRuntimeEvent(
            refund,
            '发起退款',
            `发起退款 ${refund.id}，原因：${refund.reason}，金额 ${refund.amount} 元。`,
            payload.createdBy,
            'refund_created',
          ),
        ]);
        addLog({
          actorName: payload.createdBy,
          actorRole: '运营人员',
          module: 'refund',
          actionType: 'refund_create',
          targetType: 'refund',
          targetId: refund.id,
          targetLabel: refund.orderId,
          result: 'success',
          summary: `发起退款 ${refund.id}`,
          detail: `${payload.createdBy} 为订单 ${refund.orderId} 发起退款 ${refund.id}，金额 ${refund.amount} 元。`,
          createdAt: refund.createdAt,
          relatedPath: '/refunds',
        });

        return {
          success: true,
          message: reviewRequired ? '退款已提交，等待财务审核。' : '退款已提交，进入处理中。',
          refund,
        };
      },
      approveRefund(refundId, reviewedBy) {
        const targetRefund = refunds.find((refund) => refund.id === refundId);

        if (!targetRefund) {
          return { success: false, message: '退款记录不存在。' };
        }

        if (targetRefund.reviewStatus !== 'pending') {
          return { success: false, message: '当前退款不处于待审核状态。' };
        }

        const reviewedAt = nowIsoString();

        setRefunds((previous) =>
          previous.map((refund) =>
            refund.id === refundId
              ? {
                  ...refund,
                  reviewStatus: 'approved',
                  status: 'processing',
                  reviewedBy,
                  reviewedAt,
                }
              : refund,
          ),
        );
        setRuntimeEvents((previous) => [
          ...previous,
          buildRuntimeEvent(
            targetRefund,
            '退款审核通过',
            `退款 ${targetRefund.id} 已通过审核，进入处理中。`,
            reviewedBy,
            'refund_approved',
          ),
        ]);
        addLog({
          actorName: reviewedBy,
          actorRole: '财务人员',
          module: 'refund',
          actionType: 'refund_approve',
          targetType: 'refund',
          targetId: targetRefund.id,
          targetLabel: targetRefund.orderId,
          result: 'success',
          summary: `通过退款 ${targetRefund.id} 审核`,
          detail: `${reviewedBy} 审核通过退款 ${targetRefund.id}，该退款进入处理中状态。`,
          createdAt: reviewedAt,
          relatedPath: '/refunds',
        });

        return { success: true, message: '退款审核已通过。' };
      },
      rejectRefund(refundId, reviewedBy) {
        const targetRefund = refunds.find((refund) => refund.id === refundId);

        if (!targetRefund) {
          return { success: false, message: '退款记录不存在。' };
        }

        if (targetRefund.reviewStatus !== 'pending') {
          return { success: false, message: '当前退款不处于待审核状态。' };
        }

        const reviewedAt = nowIsoString();

        setRefunds((previous) =>
          previous.map((refund) =>
            refund.id === refundId
              ? {
                  ...refund,
                  reviewStatus: 'rejected',
                  status: 'rejected',
                  reviewedBy,
                  reviewedAt,
                }
              : refund,
          ),
        );
        setRuntimeEvents((previous) => [
          ...previous,
          buildRuntimeEvent(
            targetRefund,
            '退款驳回',
            `退款 ${targetRefund.id} 已被财务驳回。`,
            reviewedBy,
            'refund_rejected',
          ),
        ]);
        addLog({
          actorName: reviewedBy,
          actorRole: '财务人员',
          module: 'refund',
          actionType: 'refund_reject',
          targetType: 'refund',
          targetId: targetRefund.id,
          targetLabel: targetRefund.orderId,
          result: 'success',
          summary: `驳回退款 ${targetRefund.id}`,
          detail: `${reviewedBy} 驳回了退款 ${targetRefund.id}。`,
          createdAt: reviewedAt,
          relatedPath: '/refunds',
        });

        return { success: true, message: '退款已驳回。' };
      },
      markRefundSuccess(refundId, operator) {
        const targetRefund = refunds.find((refund) => refund.id === refundId);

        if (!targetRefund) {
          return { success: false, message: '退款记录不存在。' };
        }

        if (targetRefund.status !== 'processing') {
          return { success: false, message: '当前退款不处于处理中状态。' };
        }

        setRefunds((previous) =>
          previous.map((refund) =>
            refund.id === refundId
              ? {
                  ...refund,
                  status: 'success',
                }
              : refund,
          ),
        );
        setRuntimeEvents((previous) => [
          ...previous,
          buildRuntimeEvent(
            targetRefund,
            '退款成功',
            `退款 ${targetRefund.id} 已退回原支付渠道。`,
            operator,
            'refund_success',
          ),
        ]);
        addLog({
          actorName: operator,
          actorRole: '系统通道',
          module: 'refund',
          actionType: 'refund_success',
          targetType: 'refund',
          targetId: targetRefund.id,
          targetLabel: targetRefund.orderId,
          result: 'success',
          summary: `退款 ${targetRefund.id} 已成功`,
          detail: `${operator} 已将退款 ${targetRefund.id} 标记为成功。`,
          createdAt: nowIsoString(),
          relatedPath: '/refunds',
        });

        return { success: true, message: '退款状态已更新为成功。' };
      },
    }),
    [addLog, orderEvents, orders, refunds],
  );

  return <RefundsContext.Provider value={value}>{children}</RefundsContext.Provider>;
}

export function useRefunds() {
  const context = useContext(RefundsContext);

  if (!context) {
    throw new Error('useRefunds 必须在 RefundsProvider 内部使用');
  }

  return context;
}
