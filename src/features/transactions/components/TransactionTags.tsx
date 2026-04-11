import { Tag } from 'antd';
import type {
  OrderStatus,
  PayChannel,
  RefundStatus,
  ReviewStatus,
  RiskLevel,
} from '../types';

const orderStatusMap: Record<OrderStatus, { color: string; label: string }> = {
  created: { color: 'default', label: '待支付' },
  paid: { color: 'green', label: '已支付' },
  refunding: { color: 'gold', label: '退款中' },
  refunded: { color: 'blue', label: '已退款' },
  failed: { color: 'red', label: '支付失败' },
  closed: { color: 'default', label: '已关闭' },
};

const riskLevelMap: Record<RiskLevel, { color: string; label: string }> = {
  none: { color: 'default', label: '正常' },
  low: { color: 'green', label: '低风险' },
  medium: { color: 'orange', label: '中风险' },
  high: { color: 'red', label: '高风险' },
};

const payChannelMap: Record<PayChannel, { color: string; label: string }> = {
  wechat: { color: 'green', label: '微信支付' },
  alipay: { color: 'blue', label: '支付宝' },
  card: { color: 'purple', label: '银行卡' },
  wallet: { color: 'cyan', label: '钱包余额' },
};

const refundStatusMap: Record<RefundStatus, { color: string; label: string }> = {
  pending: { color: 'gold', label: '待处理' },
  processing: { color: 'blue', label: '处理中' },
  success: { color: 'green', label: '退款成功' },
  failed: { color: 'red', label: '退款失败' },
  rejected: { color: 'red', label: '已驳回' },
};

const reviewStatusMap: Record<ReviewStatus, { color: string; label: string }> = {
  not_required: { color: 'default', label: '免审核' },
  pending: { color: 'gold', label: '待审核' },
  approved: { color: 'green', label: '已通过' },
  rejected: { color: 'red', label: '已驳回' },
};

export function TransactionStatusTag({ status }: { status: OrderStatus }) {
  const config = orderStatusMap[status];
  return <Tag color={config.color}>{config.label}</Tag>;
}

export function RiskLevelTag({ riskLevel }: { riskLevel: RiskLevel }) {
  const config = riskLevelMap[riskLevel];
  return <Tag color={config.color}>{config.label}</Tag>;
}

export function ChannelTag({ channel }: { channel: PayChannel }) {
  const config = payChannelMap[channel];
  return <Tag color={config.color}>{config.label}</Tag>;
}

export function RefundStatusTag({ status }: { status: RefundStatus }) {
  const config = refundStatusMap[status];
  return <Tag color={config.color}>{config.label}</Tag>;
}

export function ReviewStatusTag({ status }: { status: ReviewStatus }) {
  const config = reviewStatusMap[status];
  return <Tag color={config.color}>{config.label}</Tag>;
}

