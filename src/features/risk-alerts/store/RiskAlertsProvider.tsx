import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { mockRiskAlerts } from '../data/mock-risk-alerts';
import { handleRiskAlertAction } from '../lib/risk-alert-utils';
import type {
  RiskAlertAction,
  RiskAlertActionPayload,
  RiskAlertActionResult,
  RiskAlertRecord,
} from '../types';

type HandleRiskAlertPayload = RiskAlertActionPayload & {
  actorRole: string;
};

type RiskAlertsContextValue = {
  alerts: RiskAlertRecord[];
  handleAlertAction: (payload: HandleRiskAlertPayload) => RiskAlertActionResult;
};

const RiskAlertsContext = createContext<RiskAlertsContextValue | null>(null);

const riskActionTypeMap: Record<RiskAlertAction, 'risk_resolve' | 'risk_review' | 'risk_dismiss'> = {
  resolve: 'risk_resolve',
  review: 'risk_review',
  dismiss: 'risk_dismiss',
};

function seedAlerts() {
  return mockRiskAlerts.map((alert) => ({ ...alert }));
}

export function RiskAlertsProvider({ children }: PropsWithChildren) {
  const { addLog } = useAudit();
  const [alerts, setAlerts] = useState<RiskAlertRecord[]>(() => seedAlerts());

  const value = useMemo<RiskAlertsContextValue>(
    () => ({
      alerts,
      handleAlertAction(payload) {
        const targetAlert = alerts.find((alert) => alert.id === payload.alertId);
        const result = handleRiskAlertAction(alerts, payload);

        if (!result.success || !targetAlert) {
          return result;
        }

        setAlerts(result.alerts);
        addLog({
          actorName: payload.operator,
          actorRole: payload.actorRole,
          module: 'risk',
          actionType: riskActionTypeMap[payload.action],
          targetType: 'risk',
          targetId: targetAlert.id,
          targetLabel: targetAlert.orderId,
          result: 'success',
          summary: `${targetAlert.id} ${result.message.replace(`${targetAlert.id} `, '').replace('。', '')}`,
          detail: payload.note || `已对风险告警 ${targetAlert.id} 执行 ${payload.action} 处理动作。`,
          createdAt: payload.updatedAt,
          relatedPath: '/risk-alerts',
        });

        return result;
      },
    }),
    [addLog, alerts],
  );

  return <RiskAlertsContext.Provider value={value}>{children}</RiskAlertsContext.Provider>;
}

export function useRiskAlerts() {
  const context = useContext(RiskAlertsContext);

  if (!context) {
    throw new Error('useRiskAlerts 必须在 RiskAlertsProvider 内部使用');
  }

  return context;
}
