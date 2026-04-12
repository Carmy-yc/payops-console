import type { PayChannel } from '../transactions/types';

export type ReconciliationDiffType =
  | 'amount_mismatch'
  | 'channel_missing'
  | 'refund_mismatch'
  | 'fee_mismatch';

export type ReconciliationStatus = 'pending' | 'processing' | 'resolved' | 'ignored';

export type ReconciliationHandleAction = 'resolve' | 'review' | 'ignore';

export type ReconciliationBatch = {
  batchDate: string;
  totalOrders: number;
};

export type ReconciliationRecord = {
  id: string;
  batchDate: string;
  orderId: string;
  merchantName: string;
  payChannel: PayChannel;
  internalAmount: number;
  channelAmount: number;
  diffAmount: number;
  diffType: ReconciliationDiffType;
  status: ReconciliationStatus;
  owner?: string;
  note?: string;
  updatedAt: string;
};

export type ReconciliationFilters = {
  batchDate?: string;
  keyword?: string;
  diffType?: ReconciliationDiffType;
  status?: ReconciliationStatus;
};

export type ReconciliationSummary = {
  batchDate: string;
  totalOrders: number;
  matchedOrders: number;
  diffOrders: number;
  diffAmount: number;
  pendingCount: number;
};

export type ReconciliationActionPayload = {
  recordId: string;
  action: ReconciliationHandleAction;
  operator: string;
  note?: string;
  updatedAt: string;
};

export type ReconciliationActionResult = {
  success: boolean;
  message: string;
  records: ReconciliationRecord[];
};
