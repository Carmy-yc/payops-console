export type OrderStatus =
  | 'created'
  | 'paid'
  | 'refunding'
  | 'refunded'
  | 'failed'
  | 'closed';

export type PayChannel = 'wechat' | 'alipay' | 'card' | 'wallet';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export type RefundStatus = 'pending' | 'processing' | 'success' | 'failed' | 'rejected';

export type ReviewStatus = 'not_required' | 'pending' | 'approved' | 'rejected';

export type OrderEventType =
  | 'order_created'
  | 'payment_success'
  | 'payment_failed'
  | 'order_closed'
  | 'refund_created'
  | 'refund_approved'
  | 'refund_success'
  | 'refund_rejected'
  | 'risk_flagged';

export type TransactionOrder = {
  id: string;
  merchantId: string;
  merchantName: string;
  userId: string;
  subject: string;
  amount: number;
  refundableAmount: number;
  status: OrderStatus;
  payChannel: PayChannel;
  riskLevel: RiskLevel;
  hasRiskAlert: boolean;
  createdAt: string;
  paidAt?: string;
  updatedAt: string;
};

export type OrderEvent = {
  id: string;
  orderId: string;
  eventType: OrderEventType;
  title: string;
  description: string;
  operator: string;
  createdAt: string;
};

export type RefundRecord = {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  remark?: string;
  status: RefundStatus;
  reviewStatus: ReviewStatus;
  createdBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  source?: 'seed' | 'runtime';
};

export type TransactionFilters = {
  keyword?: string;
  status?: OrderStatus;
  payChannel?: PayChannel;
  riskLevel?: RiskLevel;
  amountMin?: number;
  amountMax?: number;
  createdFrom?: string;
  createdTo?: string;
};

export type TransactionSortField = 'amount' | 'createdAt';

export type TransactionSortOrder = 'ascend' | 'descend' | null;

export type TransactionSorter = {
  field: TransactionSortField | null;
  order: TransactionSortOrder;
};
