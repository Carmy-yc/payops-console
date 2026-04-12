import type { RiskLevel } from '../../transactions/types';
import type {
  RiskAlertAction,
  RiskAlertActionPayload,
  RiskAlertActionResult,
  RiskAlertFilters,
  RiskAlertRecord,
  RiskAlertStatus,
  RiskAlertSummary,
  RiskAlertType,
} from '../types';

type LabelConfig = {
  label: string;
  color: 'default' | 'processing' | 'warning' | 'success' | 'error';
};

type ActionConfig = {
  label: string;
  nextStatus: RiskAlertStatus;
  successMessage: string;
};

type ActionOption = {
  value: RiskAlertAction;
  label: string;
};

const openStatuses: RiskAlertStatus[] = ['pending', 'reviewing'];
const pendingActions: RiskAlertAction[] = ['resolve', 'review', 'dismiss'];
const reviewingActions: RiskAlertAction[] = ['resolve', 'dismiss'];

export const riskLevelOptions: Array<{ value: RiskLevel; label: string }> = [
  { value: 'low', label: '低风险' },
  { value: 'medium', label: '中风险' },
  { value: 'high', label: '高风险' },
];

export const riskAlertTypeConfig: Record<RiskAlertType, LabelConfig> = {
  device_anomaly: {
    label: '设备异常',
    color: 'warning',
  },
  velocity_spike: {
    label: '频次异常',
    color: 'processing',
  },
  ip_mismatch: {
    label: 'IP 异常',
    color: 'error',
  },
  chargeback_risk: {
    label: '拒付风险',
    color: 'error',
  },
  refund_abuse: {
    label: '退款滥用',
    color: 'default',
  },
};

export const riskAlertStatusConfig: Record<RiskAlertStatus, LabelConfig> = {
  pending: {
    label: '待处理',
    color: 'warning',
  },
  reviewing: {
    label: '人工复核中',
    color: 'processing',
  },
  resolved: {
    label: '已处理',
    color: 'success',
  },
  false_positive: {
    label: '误报',
    color: 'default',
  },
};

export const riskAlertActionConfig: Record<RiskAlertAction, ActionConfig> = {
  resolve: {
    label: '标记已处理',
    nextStatus: 'resolved',
    successMessage: '已标记为已处理',
  },
  review: {
    label: '升级人工审核',
    nextStatus: 'reviewing',
    successMessage: '已升级到人工审核',
  },
  dismiss: {
    label: '标记误报',
    nextStatus: 'false_positive',
    successMessage: '已标记为误报',
  },
};

export const riskAlertTypeOptions = Object.entries(riskAlertTypeConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export const riskAlertStatusOptions = Object.entries(riskAlertStatusConfig).map(
  ([value, config]) => ({
    value,
    label: config.label,
  }),
);

export function getRiskAlertActionOptions(status?: RiskAlertStatus): ActionOption[] {
  if (!status) {
    return [];
  }

  if (status === 'pending') {
    return pendingActions.map((value) => ({
      value,
      label: riskAlertActionConfig[value].label,
    }));
  }

  if (status === 'reviewing') {
    return reviewingActions.map((value) => ({
      value,
      label: riskAlertActionConfig[value].label,
    }));
  }

  return [];
}

export function filterRiskAlerts(alerts: RiskAlertRecord[], filters: RiskAlertFilters) {
  const keyword = filters.keyword?.trim().toLowerCase();

  return alerts.filter((alert) => {
    if (keyword) {
      const matchedKeyword = [alert.id, alert.orderId, alert.merchantName]
        .join(' ')
        .toLowerCase()
        .includes(keyword);

      if (!matchedKeyword) {
        return false;
      }
    }

    if (filters.riskLevel && alert.riskLevel !== filters.riskLevel) {
      return false;
    }

    if (filters.alertType && alert.alertType !== filters.alertType) {
      return false;
    }

    if (filters.status && alert.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export function summarizeRiskAlerts(alerts: RiskAlertRecord[]): RiskAlertSummary {
  return {
    totalCount: alerts.length,
    pendingCount: alerts.filter((alert) => alert.status === 'pending').length,
    reviewingCount: alerts.filter((alert) => alert.status === 'reviewing').length,
    handledCount: alerts.filter(
      (alert) => alert.status === 'resolved' || alert.status === 'false_positive',
    ).length,
  };
}

export function handleRiskAlertAction(
  alerts: RiskAlertRecord[],
  payload: RiskAlertActionPayload,
): RiskAlertActionResult {
  const targetAlert = alerts.find((alert) => alert.id === payload.alertId);

  if (!targetAlert) {
    return {
      success: false,
      message: '未找到对应的风险告警。',
      alerts,
    };
  }

  if (!openStatuses.includes(targetAlert.status)) {
    return {
      success: false,
      message: '当前告警已处理，无需重复操作。',
      alerts,
    };
  }

  if (targetAlert.status === 'reviewing' && payload.action === 'review') {
    return {
      success: false,
      message: '当前告警已在人工复核中。',
      alerts,
    };
  }

  const actionConfig = riskAlertActionConfig[payload.action];
  const note = payload.note?.trim();

  return {
    success: true,
    message: `${targetAlert.id} ${actionConfig.successMessage}。`,
    alerts: alerts.map((alert) =>
      alert.id === payload.alertId
        ? {
            ...alert,
            status: actionConfig.nextStatus,
            owner: payload.operator,
            note: note || alert.note,
            updatedAt: payload.updatedAt,
          }
        : alert,
    ),
  };
}
