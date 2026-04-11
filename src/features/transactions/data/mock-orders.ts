import type { OrderStatus, TransactionOrder } from '../types';

type OrderSeed = {
  merchantName: string;
  subject: string;
  amount: number;
  status: OrderStatus;
  payChannel: TransactionOrder['payChannel'];
  riskLevel: TransactionOrder['riskLevel'];
  hasRiskAlert: boolean;
  createdAt: [day: number, hour: number, minute: number];
  paidAt?: [day: number, hour: number, minute: number];
  updatedAt: [day: number, hour: number, minute: number];
  refundableAmount?: number;
};

function buildDate(day: number, hour: number, minute: number) {
  return new Date(Date.UTC(2026, 3, day, hour - 8, minute)).toISOString();
}

function defaultRefundableAmount(status: OrderStatus, amount: number) {
  if (status === 'paid') {
    return amount;
  }

  if (status === 'refunding') {
    return Math.round(amount * 0.4);
  }

  return 0;
}

const orderSeeds: OrderSeed[] = [
  {
    merchantName: '星云会员中心',
    subject: '年度会员续费',
    amount: 268,
    status: 'paid',
    payChannel: 'wallet',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [12, 9, 15],
    paidAt: [12, 9, 18],
    updatedAt: [12, 9, 18],
  },
  {
    merchantName: '海潮出行',
    subject: '商务用车预授权',
    amount: 428,
    status: 'paid',
    payChannel: 'wechat',
    riskLevel: 'low',
    hasRiskAlert: true,
    createdAt: [12, 8, 32],
    paidAt: [12, 8, 33],
    updatedAt: [12, 8, 45],
  },
  {
    merchantName: '青木咖啡',
    subject: '门店团购套餐',
    amount: 88,
    status: 'refunded',
    payChannel: 'alipay',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [12, 8, 5],
    paidAt: [12, 8, 6],
    updatedAt: [12, 10, 8],
  },
  {
    merchantName: '北辰教育',
    subject: '训练营报名费',
    amount: 1999,
    status: 'paid',
    payChannel: 'card',
    riskLevel: 'medium',
    hasRiskAlert: true,
    createdAt: [12, 7, 40],
    paidAt: [12, 7, 44],
    updatedAt: [12, 7, 58],
  },
  {
    merchantName: '山海健身',
    subject: '月卡购买',
    amount: 299,
    status: 'failed',
    payChannel: 'wallet',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [11, 21, 10],
    updatedAt: [11, 21, 12],
  },
  {
    merchantName: '云栖酒店',
    subject: '酒店预订担保',
    amount: 1280,
    status: 'refunding',
    payChannel: 'alipay',
    riskLevel: 'low',
    hasRiskAlert: false,
    createdAt: [11, 19, 5],
    paidAt: [11, 19, 6],
    updatedAt: [12, 10, 5],
    refundableAmount: 380,
  },
  {
    merchantName: '星云会员中心',
    subject: '季度会员续费',
    amount: 128,
    status: 'paid',
    payChannel: 'wechat',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [11, 18, 20],
    paidAt: [11, 18, 22],
    updatedAt: [11, 18, 22],
  },
  {
    merchantName: '海潮出行',
    subject: '机场接送预约',
    amount: 169,
    status: 'closed',
    payChannel: 'wechat',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [11, 17, 48],
    updatedAt: [11, 18, 10],
  },
  {
    merchantName: '曜石数码',
    subject: '配件限时抢购',
    amount: 3699,
    status: 'paid',
    payChannel: 'card',
    riskLevel: 'high',
    hasRiskAlert: true,
    createdAt: [11, 16, 9],
    paidAt: [11, 16, 10],
    updatedAt: [11, 16, 25],
  },
  {
    merchantName: '青木咖啡',
    subject: '企业团购券',
    amount: 520,
    status: 'refunded',
    payChannel: 'wallet',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [11, 15, 16],
    paidAt: [11, 15, 17],
    updatedAt: [11, 17, 40],
  },
  {
    merchantName: '北辰教育',
    subject: 'AI 公开课门票',
    amount: 59,
    status: 'paid',
    payChannel: 'alipay',
    riskLevel: 'medium',
    hasRiskAlert: true,
    createdAt: [11, 14, 30],
    paidAt: [11, 14, 31],
    updatedAt: [11, 14, 42],
  },
  {
    merchantName: '灵犀影城',
    subject: '周末观影票',
    amount: 89,
    status: 'created',
    payChannel: 'wechat',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [11, 13, 14],
    updatedAt: [11, 13, 14],
  },
  {
    merchantName: '山海健身',
    subject: '私教体验课',
    amount: 699,
    status: 'refunding',
    payChannel: 'wallet',
    riskLevel: 'low',
    hasRiskAlert: false,
    createdAt: [10, 21, 6],
    paidAt: [10, 21, 8],
    updatedAt: [11, 10, 25],
    refundableAmount: 199,
  },
  {
    merchantName: '曜石数码',
    subject: '旗舰手机预订',
    amount: 5999,
    status: 'paid',
    payChannel: 'card',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [10, 19, 44],
    paidAt: [10, 19, 46],
    updatedAt: [10, 19, 46],
  },
  {
    merchantName: '云栖酒店',
    subject: '会议室预订',
    amount: 860,
    status: 'refunded',
    payChannel: 'alipay',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [10, 17, 20],
    paidAt: [10, 17, 22],
    updatedAt: [10, 18, 10],
  },
  {
    merchantName: '灵犀影城',
    subject: '联名周边预售',
    amount: 159,
    status: 'paid',
    payChannel: 'wechat',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [10, 16, 12],
    paidAt: [10, 16, 13],
    updatedAt: [10, 16, 13],
  },
  {
    merchantName: '晨星公益',
    subject: '月度捐赠',
    amount: 50,
    status: 'failed',
    payChannel: 'wallet',
    riskLevel: 'none',
    hasRiskAlert: false,
    createdAt: [10, 15, 8],
    updatedAt: [10, 15, 9],
  },
  {
    merchantName: '北辰教育',
    subject: '证书考试报名',
    amount: 1299,
    status: 'paid',
    payChannel: 'alipay',
    riskLevel: 'low',
    hasRiskAlert: false,
    createdAt: [10, 13, 26],
    paidAt: [10, 13, 28],
    updatedAt: [10, 13, 28],
  },
];

export const mockOrders: TransactionOrder[] = orderSeeds.map((seed, index) => ({
  id: `PO20260412${String(index + 1).padStart(4, '0')}`,
  merchantId: `m_${String(index + 1).padStart(3, '0')}`,
  merchantName: seed.merchantName,
  userId: `user_${2400 + index}`,
  subject: seed.subject,
  amount: seed.amount,
  refundableAmount: seed.refundableAmount ?? defaultRefundableAmount(seed.status, seed.amount),
  status: seed.status,
  payChannel: seed.payChannel,
  riskLevel: seed.riskLevel,
  hasRiskAlert: seed.hasRiskAlert,
  createdAt: buildDate(...seed.createdAt),
  paidAt: seed.paidAt ? buildDate(...seed.paidAt) : undefined,
  updatedAt: buildDate(...seed.updatedAt),
}));

