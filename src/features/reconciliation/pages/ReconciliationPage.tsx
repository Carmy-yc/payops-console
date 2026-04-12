import { Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/store/AuthProvider';
import { usePageMessage } from '../../../shared/hooks/usePageMessage';
import { ReconciliationDiffTable } from '../components/ReconciliationDiffTable';
import { ReconciliationFilters } from '../components/ReconciliationFilters';
import { ReconciliationHandleModal } from '../components/ReconciliationHandleModal';
import { ReconciliationSummary } from '../components/ReconciliationSummary';
import {
  filterReconciliationRecords,
  summarizeReconciliation,
} from '../lib/reconciliation-utils';
import { useReconciliation } from '../store/ReconciliationProvider';
import type { ReconciliationFilters as ReconciliationFiltersValue, ReconciliationRecord } from '../types';

const { Paragraph, Title } = Typography;

export function ReconciliationPage() {
  const { currentUser } = useAuth();
  const { batches, records, handleRecordAction } = useReconciliation();
  const defaultBatchDate = batches[0]?.batchDate;
  const [filters, setFilters] = useState<ReconciliationFiltersValue>(() => ({
    batchDate: defaultBatchDate,
  }));
  const [activeRecord, setActiveRecord] = useState<ReconciliationRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const { contextHolder, showResult } = usePageMessage();

  const selectedBatchDate = filters.batchDate ?? defaultBatchDate;
  const activeBatch =
    batches.find((batch) => batch.batchDate === selectedBatchDate) ??
    batches[0];

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
      batches.map((batch) => ({
        label: batch.batchDate,
        value: batch.batchDate,
      })),
    [batches],
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

          const result = handleRecordAction({
            recordId: activeRecord.id,
            action: values.action,
            note: values.note,
            operator: currentUser?.name ?? '财务同学',
            actorRole: currentUser?.roleName ?? '财务人员',
            updatedAt: new Date().toISOString(),
          });

          showResult(result);

          if (!result.success) {
            return;
          }
          closeModal();
        }}
      />
    </Space>
  );
}
