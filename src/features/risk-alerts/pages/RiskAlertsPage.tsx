import { Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { useAuth } from '../../auth/store/AuthProvider';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { usePageMessage } from '../../../shared/hooks/usePageMessage';
import { RiskAlertDetailDrawer } from '../components/RiskAlertDetailDrawer';
import { RiskAlertFilters } from '../components/RiskAlertFilters';
import { RiskAlertStats } from '../components/RiskAlertStats';
import { RiskAlertsTable } from '../components/RiskAlertsTable';
import { mockRiskAlerts } from '../data/mock-risk-alerts';
import {
  filterRiskAlerts,
  handleRiskAlertAction,
  summarizeRiskAlerts,
} from '../lib/risk-alert-utils';
import type { RiskAlertFilters as RiskAlertFiltersValue, RiskAlertRecord } from '../types';

const { Paragraph, Title } = Typography;

export function RiskAlertsPage() {
  const { addLog } = useAudit();
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState<RiskAlertFiltersValue>({});
  const [alerts, setAlerts] = useState(mockRiskAlerts);
  const [activeAlert, setActiveAlert] = useState<RiskAlertRecord>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { contextHolder, showResult } = usePageMessage();

  const canHandle = Boolean(currentUser?.permissions.includes(PERMISSIONS.riskHandle));

  const filteredAlerts = useMemo(
    () => filterRiskAlerts(alerts, filters).sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [alerts, filters],
  );

  const summary = useMemo(() => summarizeRiskAlerts(alerts), [alerts]);

  function closeDrawer() {
    setDrawerOpen(false);
    setActiveAlert(undefined);
  }

  function openDrawer(record: RiskAlertRecord) {
    setActiveAlert(record);
    setDrawerOpen(true);
  }

  return (
    <Space direction="vertical" size={16} className="full-width">
      {contextHolder}

      <div>
        <Title level={3}>风险告警</Title>
        <Paragraph type="secondary">
          这一页模拟支付风控告警中心，支持查看告警详情、跳转订单，以及完成最小处置闭环。
        </Paragraph>
      </div>

      <RiskAlertStats summary={summary} />

      <RiskAlertFilters onSearch={setFilters} onReset={() => setFilters({})} />

      <RiskAlertsTable data={filteredAlerts} onView={openDrawer} />

      <RiskAlertDetailDrawer
        open={drawerOpen}
        record={activeAlert}
        canHandle={canHandle}
        onClose={closeDrawer}
        onSubmit={(values) => {
          if (!activeAlert) {
            return;
          }

          const result = handleRiskAlertAction(alerts, {
            alertId: activeAlert.id,
            action: values.action,
            note: values.note,
            operator: currentUser?.name ?? '风控同学',
            updatedAt: new Date().toISOString(),
          });

          showResult(result);

          if (!result.success) {
            return;
          }

          const actionTypeMap = {
            resolve: 'risk_resolve',
            review: 'risk_review',
            dismiss: 'risk_dismiss',
          } as const;

          addLog({
            actorName: currentUser?.name ?? '风控同学',
            actorRole: currentUser?.roleName ?? '风控人员',
            module: 'risk',
            actionType: actionTypeMap[values.action],
            targetType: 'risk',
            targetId: activeAlert.id,
            targetLabel: activeAlert.orderId,
            result: 'success',
            summary: `${activeAlert.id} ${result.message.replace(`${activeAlert.id} `, '').replace('。', '')}`,
            detail: values.note || `已对风险告警 ${activeAlert.id} 执行 ${values.action} 处理动作。`,
            createdAt: new Date().toISOString(),
            relatedPath: '/risk-alerts',
          });

          setAlerts(result.alerts);
          closeDrawer();
        }}
      />
    </Space>
  );
}
