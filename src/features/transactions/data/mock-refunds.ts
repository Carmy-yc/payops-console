import type { RefundRecord } from '../types';

function buildDate(day: number, hour: number, minute: number) {
  return new Date(Date.UTC(2026, 3, day, hour - 8, minute)).toISOString();
}

export const mockRefunds: RefundRecord[] = [
  {
    id: 'RF202604120001',
    orderId: 'PO202604120003',
    amount: 88,
    reason: '用户取消订单',
    createdBy: '运营人员',
    status: 'success',
    reviewStatus: 'not_required',
    createdAt: buildDate(12, 9, 30),
  },
  {
    id: 'RF202604120002',
    orderId: 'PO202604120006',
    amount: 900,
    reason: '酒店库存回滚',
    createdBy: '运营人员',
    reviewedBy: '财务人员',
    status: 'processing',
    reviewStatus: 'approved',
    createdAt: buildDate(12, 9, 42),
  },
  {
    id: 'RF202604120003',
    orderId: 'PO202604120010',
    amount: 520,
    reason: '批量核销失败',
    createdBy: '运营人员',
    status: 'success',
    reviewStatus: 'not_required',
    createdAt: buildDate(11, 16, 20),
  },
  {
    id: 'RF202604120004',
    orderId: 'PO202604120013',
    amount: 500,
    reason: '课程改期补偿',
    createdBy: '运营人员',
    status: 'pending',
    reviewStatus: 'pending',
    createdAt: buildDate(11, 10, 20),
  },
  {
    id: 'RF202604120005',
    orderId: 'PO202604120015',
    amount: 860,
    reason: '会议取消',
    createdBy: '运营人员',
    reviewedBy: '财务人员',
    status: 'success',
    reviewStatus: 'approved',
    createdAt: buildDate(10, 17, 50),
  },
];
