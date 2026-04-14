import { mockOrders } from '../../transactions/data/mock-orders';
import type { RiskAlertRecord, RiskAlertStatus, RiskAlertType } from '../types';

type AlertSeed = {
  id: string;
  orderId: string;
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

function buildDate(day: number, hour: number, minute: number) {
  return new Date(Date.UTC(2026, 3, day, hour - 8, minute)).toISOString();
}

const orderMap = new Map(mockOrders.map((order) => [order.id, order]));

function createAlert(seed: AlertSeed): RiskAlertRecord {
  const order = orderMap.get(seed.orderId);

  if (!order) {
    throw new Error(`Unknown order id: ${seed.orderId}`);
  }

  return {
    id: seed.id,
    orderId: seed.orderId,
    merchantName: order.merchantName,
    subject: order.subject,
    amount: order.amount,
    payChannel: order.payChannel,
    orderStatus: order.status,
    riskLevel: order.riskLevel,
    alertType: seed.alertType,
    ruleName: seed.ruleName,
    riskScore: seed.riskScore,
    description: seed.description,
    suggestion: seed.suggestion,
    status: seed.status,
    owner: seed.owner,
    note: seed.note,
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
  };
}

export const mockRiskAlerts: RiskAlertRecord[] = [
  createAlert({
    id: 'RA202604120001',
    orderId: 'PO202604120009',
    alertType: 'chargeback_risk',
    ruleName: '高价值订单拒付风险',
    riskScore: 95,
    description: '同设备近 7 天存在拒付历史，本次订单金额较高，命中高风险交易策略。',
    suggestion: '建议先人工核验收货信息和支付账户一致性，再决定是否放行。',
    status: 'reviewing',
    owner: '沈知行',
    note: '已升级人工审核，等待商户补充订单凭证。',
    createdAt: buildDate(12, 10, 18),
    updatedAt: buildDate(12, 10, 32),
  }),
  createAlert({
    id: 'RA202604120002',
    orderId: 'PO202604120004',
    alertType: 'velocity_spike',
    ruleName: '新商户大额首单',
    riskScore: 86,
    description: '商户首单即出现高金额支付，且用户历史交易样本较少，需要人工关注。',
    suggestion: '建议联系商户确认订单真实性，并核验用户支付来源。',
    status: 'pending',
    createdAt: buildDate(12, 9, 42),
    updatedAt: buildDate(12, 9, 42),
  }),
  createAlert({
    id: 'RA202604120003',
    orderId: 'PO202604120002',
    alertType: 'device_anomaly',
    ruleName: '同设备跨城市支付',
    riskScore: 74,
    description: '30 分钟内同设备触发多笔跨城市支付，设备指纹存在异常切换。',
    suggestion: '建议核验设备指纹、登录环境和实名信息是否一致。',
    status: 'pending',
    createdAt: buildDate(12, 9, 12),
    updatedAt: buildDate(12, 9, 12),
  }),
  createAlert({
    id: 'RA202604120004',
    orderId: 'PO202604120011',
    alertType: 'ip_mismatch',
    ruleName: '支付 IP 与常用地区不一致',
    riskScore: 69,
    description: '用户本次支付来源 IP 与近 30 天常用支付地区差异较大。',
    suggestion: '建议确认是否为异地购买或企业代付场景。',
    status: 'resolved',
    owner: '沈知行',
    note: '已联系商户确认，为企业客户异地代付场景。',
    createdAt: buildDate(11, 15, 8),
    updatedAt: buildDate(11, 15, 26),
  }),
  createAlert({
    id: 'RA202604120005',
    orderId: 'PO202604120009',
    alertType: 'ip_mismatch',
    ruleName: '境外 IP + 国内卡 BIN',
    riskScore: 91,
    description: '支付 IP 位于境外，但银行卡 BIN 信息与国内发行地区匹配，存在异常组合。',
    suggestion: '建议复核持卡人信息与收货信息是否一致。',
    status: 'pending',
    createdAt: buildDate(12, 10, 6),
    updatedAt: buildDate(12, 10, 6),
  }),
  createAlert({
    id: 'RA202604120006',
    orderId: 'PO202604120004',
    alertType: 'refund_abuse',
    ruleName: '高风险订单退款倾向',
    riskScore: 63,
    description: '该用户近期存在多次下单后短时退款行为，当前订单命中退款滥用观察规则。',
    suggestion: '建议关注后续退款申请，必要时限制高风险渠道放量。',
    status: 'false_positive',
    owner: '沈知行',
    note: '历史样本核验后确认是测试账号，不再拦截。',
    createdAt: buildDate(11, 18, 42),
    updatedAt: buildDate(11, 19, 12),
  }),
];
