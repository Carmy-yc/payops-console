import { Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { useAuth } from '../../auth/store/AuthProvider';
import { usePageMessage } from '../../../shared/hooks/usePageMessage';
import { ReconciliationDiffTable } from '../components/ReconciliationDiffTable';
import { ReconciliationFilters } from '../components/ReconciliationFilters';
import { ReconciliationHandleModal } from '../components/ReconciliationHandleModal';
import { ReconciliationSummary } from '../components/ReconciliationSummary';
import {
  mockReconciliationBatches,
  mockReconciliationRecords,
} from '../data/mock-reconciliation-records';
import {
  filterReconciliationRecords,
  handleReconciliationAction,
  summarizeReconciliation,
} from '../lib/reconciliation-utils';
import type { ReconciliationFilters as ReconciliationFiltersValue, ReconciliationRecord } from '../types';

const { Paragraph, Title } = Typography;

const defaultBatchDate = mockReconciliationBatches[0]?.batchDate;

export function ReconciliationPage() {
  const { addLog } = useAudit();
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState<ReconciliationFiltersValue>({
    batchDate: defaultBatchDate,
  });
  const [records, setRecords] = useState(mockReconciliationRecords);
  const [activeRecord, setActiveRecord] = useState<ReconciliationRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const { contextHolder, showResult } = usePageMessage();

  const selectedBatchDate = filters.batchDate ?? defaultBatchDate;
  const activeBatch =
    mockReconciliationBatches.find((batch) => batch.batchDate === selectedBatchDate) ??
    mockReconciliationBatches[0];

  const batchRecords = useMemo(
    () => filterReconciliationRecords(records, { batchDate: activeBatch.batchDate }),
    [activeBatch.batchDate, records],
  );

  const filteredRecords = useMemo(
    () => filterReconciliationRecords(records, filters),
    [filters, records],
  );

  const summary = useMemo(
    () => summarizeReconciliation(activeBatch, batchRecords),
    [activeBatch, batchRecords],
  );

  const batchOptions = useMemo(
    () =>
      mockReconciliationBatches.map((batch) => ({
        label: batch.batchDate,
        value: batch.batchDate,
      })),
    [],
  );

  function closeModal() {
    setModalOpen(false);
    setActiveRecord(undefined);
  }

  function openHandleModal(record: ReconciliationRecord) {
    setActiveRecord(record);
    setModalOpen(true);
  }

  return (
    <Space direction="vertical" size={16} className="full-width">
      {contextHolder}

      <div>
        <Title level={3}>对账中心</Title>
        <Paragraph type="secondary">
          这一页模拟每日渠道对账结果，集中展示批次汇总、差异订单筛选，以及财务处理差异的最小闭环。
        </Paragraph>
      </div>

      <ReconciliationSummary summary={summary} />

      <ReconciliationFilters
        defaultValues={{ batchDate: defaultBatchDate }}
        batchOptions={batchOptions}
        onSearch={(values) => {
          setFilters({
            ...values,
            batchDate: values.batchDate ?? defaultBatchDate,
          });
        }}
        onReset={() => {
          setFilters({ batchDate: defaultBatchDate });
        }}
      />

      <ReconciliationDiffTable data={filteredRecords} onHandle={openHandleModal} />

      <ReconciliationHandleModal
        open={modalOpen}
        record={activeRecord}
        onCancel={closeModal}
        onSubmit={(values) => {
          if (!activeRecord) {
            return;
          }

          const result = handleReconciliationAction(records, {
            recordId: activeRecord.id,
            action: values.action,
            note: values.note,
            operator: currentUser?.name ?? '财务同学',
            updatedAt: new Date().toISOString(),
          });

          showResult(result);

          if (!result.success) {
            return;
          }

          const actionTypeMap = {
            resolve: 'reconciliation_resolve',
            review: 'reconciliation_review',
            ignore: 'reconciliation_ignore',
          } as const;

          addLog({
            actorName: currentUser?.name ?? '财务同学',
            actorRole: currentUser?.roleName ?? '财务人员',
            module: 'reconciliation',
            actionType: actionTypeMap[values.action],
            targetType: 'reconciliation',
            targetId: activeRecord.id,
            targetLabel: activeRecord.orderId,
            result: 'success',
            summary: `${activeRecord.id} ${result.message.replace(`${activeRecord.id} `, '').replace('。', '')}`,
            detail: values.note || `已对差异单 ${activeRecord.id} 执行 ${values.action} 处理动作。`,
            createdAt: new Date().toISOString(),
            relatedPath: '/reconciliation',
          });

          setRecords(result.records);
          closeModal();
        }}
      />
    </Space>
  );
}
