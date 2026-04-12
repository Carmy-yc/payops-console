import { mockOrders } from '../../transactions/data/mock-orders';
import type { ReconciliationBatch, ReconciliationDiffType, ReconciliationRecord, ReconciliationStatus } from '../types';

type RecordSeed = {
  id: string;
  batchDate: string;
  orderId: string;
  internalAmount?: number;
  channelAmount: number;
  diffType: ReconciliationDiffType;
  status: ReconciliationStatus;
  owner?: string;
  note?: string;
  updatedAt: string;
};

function buildDate(day: number, hour: number, minute: number) {
  return new Date(Date.UTC(2026, 3, day, hour - 8, minute)).toISOString();
}

const orderMap = new Map(mockOrders.map((order) => [order.id, order]));

function createRecord(seed: RecordSeed): ReconciliationRecord {
  const order = orderMap.get(seed.orderId);

  if (!order) {
    throw new Error(`Unknown order id: ${seed.orderId}`);
  }

  const internalAmount = seed.internalAmount ?? order.amount;

  return {
    id: seed.id,
    batchDate: seed.batchDate,
    orderId: seed.orderId,
    merchantName: order.merchantName,
    payChannel: order.payChannel,
    internalAmount,
    channelAmount: seed.channelAmount,
    diffAmount: Number((seed.channelAmount - internalAmount).toFixed(2)),
    diffType: seed.diffType,
    status: seed.status,
    owner: seed.owner,
    note: seed.note,
    updatedAt: seed.updatedAt,
  };
}

export const mockReconciliationBatches: ReconciliationBatch[] = [
  {
    batchDate: '2026-04-11',
    totalOrders: 1286,
  },
  {
    batchDate: '2026-04-10',
    totalOrders: 1198,
  },
  {
    batchDate: '2026-04-09',
    totalOrders: 1142,
  },
];

export const mockReconciliationRecords: ReconciliationRecord[] = [
  createRecord({
    id: 'RC202604110001',
    batchDate: '2026-04-11',
    orderId: 'PO202604120002',
    channelAmount: 418,
    diffType: 'amount_mismatch',
    status: 'pending',
    updatedAt: buildDate(12, 9, 12),
  }),
  createRecord({
    id: 'RC202604110002',
    batchDate: '2026-04-11',
    orderId: 'PO202604120004',
    channelAmount: 0,
    diffType: 'channel_missing',
    status: 'pending',
    updatedAt: buildDate(12, 9, 18),
  }),
  createRecord({
    id: 'RC202604110003',
    batchDate: '2026-04-11',
    orderId: 'PO202604120006',
    internalAmount: 380,
    channelAmount: 280,
    diffType: 'refund_mismatch',
    status: 'processing',
    owner: '财务同学',
    note: '已转人工复核，等待渠道侧退款回执。',
    updatedAt: buildDate(12, 10, 4),
  }),
  createRecord({
    id: 'RC202604110004',
    batchDate: '2026-04-11',
    orderId: 'PO202604120007',
    channelAmount: 126,
    diffType: 'fee_mismatch',
    status: 'resolved',
    owner: '财务同学',
    note: '确认渠道手续费口径差异，已手工对平。',
    updatedAt: buildDate(12, 8, 46),
  }),
  createRecord({
    id: 'RC202604110005',
    batchDate: '2026-04-11',
    orderId: 'PO202604120011',
    channelAmount: 59.01,
    diffType: 'amount_mismatch',
    status: 'ignored',
    owner: '系统管理员',
    note: '尾差 0.01 元，按财务规则忽略。',
    updatedAt: buildDate(12, 8, 28),
  }),
  createRecord({
    id: 'RC202604100001',
    batchDate: '2026-04-10',
    orderId: 'PO202604120014',
    channelAmount: 5998,
    diffType: 'amount_mismatch',
    status: 'pending',
    updatedAt: buildDate(11, 9, 11),
  }),
  createRecord({
    id: 'RC202604100002',
    batchDate: '2026-04-10',
    orderId: 'PO202604120015',
    internalAmount: 860,
    channelAmount: 760,
    diffType: 'refund_mismatch',
    status: 'resolved',
    owner: '财务同学',
    note: '渠道退款补单完成，已重新对平。',
    updatedAt: buildDate(11, 10, 32),
  }),
  createRecord({
    id: 'RC202604100003',
    batchDate: '2026-04-10',
    orderId: 'PO202604120018',
    channelAmount: 1297,
    diffType: 'fee_mismatch',
    status: 'processing',
    owner: '财务同学',
    note: '渠道对账单待更新，继续跟进。',
    updatedAt: buildDate(11, 11, 9),
  }),
];
