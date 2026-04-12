import { message, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/store/AuthProvider';
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
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState<ReconciliationFiltersValue>({
    batchDate: defaultBatchDate,
  });
  const [records, setRecords] = useState(mockReconciliationRecords);
  const [activeRecord, setActiveRecord] = useState<ReconciliationRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

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

          result.success ? messageApi.success(result.message) : messageApi.error(result.message);

          if (!result.success) {
            return;
          }

          setRecords(result.records);
          closeModal();
        }}
      />
    </Space>
  );
}
