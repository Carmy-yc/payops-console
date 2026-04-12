import { PERMISSIONS, type PermissionKey } from '../../../shared/constants/permissions';
import type { PayChannel } from '../../transactions/types';
import { mockDashboardTrendSeries } from '../data/mock-dashboard-trends';
import type { ReconciliationRecord } from '../../reconciliation/types';
import type { RiskAlertRecord } from '../../risk-alerts/types';
import type { RefundRecord, TransactionOrder } from '../../transactions/types';

const successfulOrderStatuses = new Set(['paid', 'refunding', 'refunded']);
const openReconciliationStatuses = new Set(['pending', 'processing']);
const openRiskStatuses = new Set(['pending', 'reviewing']);

export type DashboardMetrics = {
  referenceDate: string;
  todayGrossAmount: number;
  todayOrderCount: number;
  todaySuccessCount: number;
  todaySuccessRate: number;
  todayRefundAmount: number;
  todayRefundCount: number;
  openIssueCount: number;
  openRefundCount: number;
  openReconciliationCount: number;
  openRiskCount: number;
};

export type DashboardTodoItem = {
  key: string;
  title: string;
  count: number;
  description: string;
  path: string;
  permission: PermissionKey;
};

export type DashboardExceptionItem = {
  key: string;
  moduleLabel: string;
  statusLabel: string;
  title: string;
  summary: string;
  path: string;
  permission: PermissionKey;
  levelColor: 'warning' | 'processing' | 'error';
  occurredAt: string;
};

export type DashboardTrendPoint = {
  date: string;
  label: string;
  grossAmount: number;
  orderCount: number;
};

export type DashboardChannelStat = {
  channel: PayChannel;
  label: string;
  amount: number;
  count: number;
  percent: number;
  color: string;
};

export type DashboardIssueStat = {
  key: string;
  label: string;
  count: number;
  description: string;
  color: string;
};

const payChannelLabelMap: Record<PayChannel, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  card: '银行卡',
  wallet: '钱包余额',
};

const payChannelColorMap: Record<PayChannel, string> = {
  wechat: '#5b8ff9',
  alipay: '#36cfc9',
  card: '#faad14',
  wallet: '#8c8c8c',
};

function toDateKey(value?: string) {
  return value?.slice(0, 10) ?? '';
}

function formatTrendLabel(date: string) {
  return date.slice(5).replace('-', '/');
}

function getReferenceDate(orders: TransactionOrder[]) {
  return orders.reduce((latest, order) => {
    const currentDate = toDateKey(order.createdAt);
    return currentDate > latest ? currentDate : latest;
  }, '');
}

export function buildDashboardMetrics(
  orders: TransactionOrder[],
  refunds: RefundRecord[],
  reconciliationRecords: ReconciliationRecord[],
  riskAlerts: RiskAlertRecord[],
): DashboardMetrics {
  const referenceDate = getReferenceDate(orders);
  const todayOrders = orders.filter((order) => toDateKey(order.createdAt) === referenceDate);
  const successfulOrders = todayOrders.filter((order) => successfulOrderStatuses.has(order.status));
  const todayRefunds = refunds.filter((refund) => toDateKey(refund.createdAt) === referenceDate);
  const openRefundCount = refunds.filter((refund) => refund.reviewStatus === 'pending').length;
  const openReconciliationCount = reconciliationRecords.filter((record) =>
    openReconciliationStatuses.has(record.status),
  ).length;
  const openRiskCount = riskAlerts.filter((alert) => openRiskStatuses.has(alert.status)).length;

  const todayGrossAmount = successfulOrders.reduce((sum, order) => sum + order.amount, 0);
  const todaySuccessRate =
    todayOrders.length > 0 ? (successfulOrders.length / todayOrders.length) * 100 : 0;
  const todayRefundAmount = todayRefunds.reduce((sum, refund) => sum + refund.amount, 0);

  return {
    referenceDate,
    todayGrossAmount: Number(todayGrossAmount.toFixed(2)),
    todayOrderCount: todayOrders.length,
    todaySuccessCount: successfulOrders.length,
    todaySuccessRate: Number(todaySuccessRate.toFixed(1)),
    todayRefundAmount: Number(todayRefundAmount.toFixed(2)),
    todayRefundCount: todayRefunds.length,
    openIssueCount: openRefundCount + openReconciliationCount + openRiskCount,
    openRefundCount,
    openReconciliationCount,
    openRiskCount,
  };
}

export function buildDashboardTrendSeries(
  referenceDate: string,
  todayGrossAmount: number,
  todayOrderCount: number,
): DashboardTrendPoint[] {
  return mockDashboardTrendSeries.map((item) => {
    const shouldUseRuntimeValue = item.date === referenceDate;

    return {
      date: item.date,
      label: formatTrendLabel(item.date),
      grossAmount: shouldUseRuntimeValue ? todayGrossAmount : item.grossAmount,
      orderCount: shouldUseRuntimeValue ? todayOrderCount : item.orderCount,
    };
  });
}

export function buildDashboardChannelStats(
  orders: TransactionOrder[],
  referenceDate: string,
): DashboardChannelStat[] {
  const todaySuccessfulOrders = orders.filter(
    (order) => toDateKey(order.createdAt) === referenceDate && successfulOrderStatuses.has(order.status),
  );
  const totalAmount = todaySuccessfulOrders.reduce((sum, order) => sum + order.amount, 0);

  return Object.entries(payChannelLabelMap)
    .map(([channel, label]) => {
      const channelOrders = todaySuccessfulOrders.filter((order) => order.payChannel === channel);
      const amount = channelOrders.reduce((sum, order) => sum + order.amount, 0);

      return {
        channel: channel as PayChannel,
        label,
        amount: Number(amount.toFixed(2)),
        count: channelOrders.length,
        percent: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        color: payChannelColorMap[channel as PayChannel],
      };
    })
    .filter((item) => item.amount > 0)
    .sort((left, right) => right.amount - left.amount);
}

export function buildDashboardIssueStats(
  openRefundCount: number,
  openReconciliationCount: number,
  openRiskCount: number,
): DashboardIssueStat[] {
  return [
    {
      key: 'refunds',
      label: '退款积压',
      count: openRefundCount,
      description: '关注大额退款审核与处理时效。',
      color: '#faad14',
    },
    {
      key: 'reconciliation',
      label: '对账差异',
      count: openReconciliationCount,
      description: '优先推进待处理和人工复核中的差异单。',
      color: '#ff7875',
    },
    {
      key: 'risk-alerts',
      label: '风险告警',
      count: openRiskCount,
      description: '跟进待处理与人工审核中的高风险订单。',
      color: '#5b8ff9',
    },
  ];
}

export function buildDashboardTodoItems(
  refunds: RefundRecord[],
  reconciliationRecords: ReconciliationRecord[],
  riskAlerts: RiskAlertRecord[],
): DashboardTodoItem[] {
  const pendingRefunds = refunds.filter((refund) => refund.reviewStatus === 'pending').length;
  const openReconciliation = reconciliationRecords.filter((record) =>
    openReconciliationStatuses.has(record.status),
  ).length;
  const openRiskAlerts = riskAlerts.filter((alert) => openRiskStatuses.has(alert.status)).length;

  return [
    {
      key: 'refunds',
      title: '待审核退款',
      count: pendingRefunds,
      description:
        pendingRefunds > 0
          ? '存在大额退款等待财务审核，建议优先确认资金处理。'
          : '当前没有需要人工审核的退款申请。',
      path: '/refunds',
      permission: PERMISSIONS.refundList,
    },
    {
      key: 'reconciliation',
      title: '待处理对账差异',
      count: openReconciliation,
      description:
        openReconciliation > 0
          ? '仍有差异单未完成对平，建议尽快跟进渠道回执。'
          : '当前差异单已收敛，没有新增积压。',
      path: '/reconciliation',
      permission: PERMISSIONS.reconciliationView,
    },
    {
      key: 'risk-alerts',
      title: '待跟进风险告警',
      count: openRiskAlerts,
      description:
        openRiskAlerts > 0
          ? '存在待处理或人工审核中的风控告警，需要持续跟进。'
          : '当前风控告警已基本处理完成。',
      path: '/risk-alerts',
      permission: PERMISSIONS.riskList,
    },
  ];
}

export function buildDashboardExceptions(
  refunds: RefundRecord[],
  reconciliationRecords: ReconciliationRecord[],
  riskAlerts: RiskAlertRecord[],
): DashboardExceptionItem[] {
  const refundExceptions: DashboardExceptionItem[] = refunds
    .filter((refund) => refund.reviewStatus === 'pending')
    .map((refund) => ({
      key: refund.id,
      moduleLabel: '退款',
      statusLabel: '待审核',
      title: `${refund.id} 等待人工审核`,
      summary: `订单 ${refund.orderId} 发起了 ${refund.amount.toFixed(2)} 元退款，当前仍在等待财务处理。`,
      path: '/refunds',
      permission: PERMISSIONS.refundList,
      levelColor: 'warning',
      occurredAt: refund.createdAt,
    }));

  const reconciliationExceptions: DashboardExceptionItem[] = reconciliationRecords
    .filter((record) => openReconciliationStatuses.has(record.status))
    .map((record) => ({
      key: record.id,
      moduleLabel: '对账',
      statusLabel: record.status === 'processing' ? '人工复核中' : '待处理',
      title: `${record.id} 存在 ${record.diffType} 差异`,
      summary: `订单 ${record.orderId} 当前差异金额为 ${record.diffAmount.toFixed(2)} 元，需继续跟进处理结果。`,
      path: '/reconciliation',
      permission: PERMISSIONS.reconciliationView,
      levelColor: record.status === 'processing' ? 'processing' : 'error',
      occurredAt: record.updatedAt,
    }));

  const riskExceptions: DashboardExceptionItem[] = riskAlerts
    .filter((alert) => openRiskStatuses.has(alert.status))
    .map((alert) => ({
      key: alert.id,
      moduleLabel: '风控',
      statusLabel: alert.status === 'reviewing' ? '人工审核中' : '待处理',
      title: `${alert.id} 命中 ${alert.ruleName}`,
      summary: `订单 ${alert.orderId} 风险分 ${alert.riskScore}，建议尽快确认商户凭证或支付环境。`,
      path: '/risk-alerts',
      permission: PERMISSIONS.riskList,
      levelColor: alert.riskScore >= 85 ? 'error' : alert.status === 'reviewing' ? 'processing' : 'warning',
      occurredAt: alert.updatedAt,
    }));

  return [...riskExceptions, ...reconciliationExceptions, ...refundExceptions]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 6);
}
