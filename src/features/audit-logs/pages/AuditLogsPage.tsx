import { Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { AuditLogDetailDrawer } from '../components/AuditLogDetailDrawer';
import { AuditLogFilters } from '../components/AuditLogFilters';
import { AuditLogStats } from '../components/AuditLogStats';
import { AuditLogsTable } from '../components/AuditLogsTable';
import { useAudit } from '../store/AuditProvider';
import { filterAuditLogs, summarizeAuditLogs } from '../lib/audit-log-utils';
import type { AuditLogFilters as AuditLogFiltersValue, AuditLogRecord } from '../types';

const { Paragraph, Title } = Typography;

export function AuditLogsPage() {
  const { logs } = useAudit();
  const [filters, setFilters] = useState<AuditLogFiltersValue>({});
  const [activeLog, setActiveLog] = useState<AuditLogRecord>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const summary = useMemo(() => summarizeAuditLogs(logs), [logs]);
  const filteredLogs = useMemo(
    () => filterAuditLogs(logs, filters).sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [filters, logs],
  );

  function openDrawer(record: AuditLogRecord) {
    setActiveLog(record);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setActiveLog(undefined);
  }

  return (
    <Space direction="vertical" size={16} className="full-width">
      <div>
        <Title level={3}>审计日志</Title>
        <Paragraph type="secondary">
          这一页集中查看登录、退款、对账和风控的关键操作留痕，支持按人、按模块、按动作检索。
        </Paragraph>
      </div>

      <AuditLogStats summary={summary} />

      <AuditLogFilters onSearch={setFilters} onReset={() => setFilters({})} />

      <AuditLogsTable data={filteredLogs} onView={openDrawer} />

      <AuditLogDetailDrawer open={drawerOpen} record={activeLog} onClose={closeDrawer} />
    </Space>
  );
}
