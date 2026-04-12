import type { OrderStatus, PayChannel, RiskLevel } from '../transactions/types';

export type RiskAlertType =
  | 'device_anomaly'
  | 'velocity_spike'
  | 'ip_mismatch'
  | 'chargeback_risk'
  | 'refund_abuse';

export type RiskAlertStatus = 'pending' | 'reviewing' | 'resolved' | 'false_positive';

export type RiskAlertAction = 'resolve' | 'review' | 'dismiss';

export type RiskAlertRecord = {
  id: string;
  orderId: string;
  merchantName: string;
  subject: string;
  amount: number;
  payChannel: PayChannel;
  orderStatus: OrderStatus;
  riskLevel: RiskLevel;
  alertType: RiskAlertType;
  ruleName: string;
  riskScore: number;
  description: string;
  suggestion: string;
  status: RiskAlertStatus;
  owner?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type RiskAlertFilters = {
  keyword?: string;
  riskLevel?: RiskLevel;
  alertType?: RiskAlertType;
  status?: RiskAlertStatus;
};

export type RiskAlertSummary = {
  totalCount: number;
  pendingCount: number;
  reviewingCount: number;
  handledCount: number;
};

export type RiskAlertActionPayload = {
  alertId: string;
  action: RiskAlertAction;
  operator: string;
  note?: string;
  updatedAt: string;
};

export type RiskAlertActionResult = {
  success: boolean;
  message: string;
  alerts: RiskAlertRecord[];
};
