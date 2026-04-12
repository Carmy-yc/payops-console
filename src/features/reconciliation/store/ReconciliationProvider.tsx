import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { useAudit } from '../../audit-logs/store/AuditProvider';
import { mockReconciliationBatches, mockReconciliationRecords } from '../data/mock-reconciliation-records';
import { handleReconciliationAction } from '../lib/reconciliation-utils';
import type {
  ReconciliationActionPayload,
  ReconciliationActionResult,
  ReconciliationBatch,
  ReconciliationHandleAction,
  ReconciliationRecord,
} from '../types';

type HandleReconciliationPayload = ReconciliationActionPayload & {
  actorRole: string;
};

type ReconciliationContextValue = {
  batches: ReconciliationBatch[];
  records: ReconciliationRecord[];
  handleRecordAction: (payload: HandleReconciliationPayload) => ReconciliationActionResult;
};

const ReconciliationContext = createContext<ReconciliationContextValue | null>(null);

const reconciliationActionTypeMap: Record<ReconciliationHandleAction, 'reconciliation_resolve' | 'reconciliation_review' | 'reconciliation_ignore'> = {
  resolve: 'reconciliation_resolve',
  review: 'reconciliation_review',
  ignore: 'reconciliation_ignore',
};

function seedBatches() {
  return mockReconciliationBatches.map((batch) => ({ ...batch }));
}

function seedRecords() {
  return mockReconciliationRecords.map((record) => ({ ...record }));
}

export function ReconciliationProvider({ children }: PropsWithChildren) {
  const { addLog } = useAudit();
  const [records, setRecords] = useState<ReconciliationRecord[]>(() => seedRecords());
  const batches = useMemo(() => seedBatches(), []);

  const value = useMemo<ReconciliationContextValue>(
    () => ({
      batches,
      records,
      handleRecordAction(payload) {
        const targetRecord = records.find((record) => record.id === payload.recordId);
        const result = handleReconciliationAction(records, payload);

        if (!result.success || !targetRecord) {
          return result;
        }

        setRecords(result.records);
        addLog({
          actorName: payload.operator,
          actorRole: payload.actorRole,
          module: 'reconciliation',
          actionType: reconciliationActionTypeMap[payload.action],
          targetType: 'reconciliation',
          targetId: targetRecord.id,
          targetLabel: targetRecord.orderId,
          result: 'success',
          summary: `${targetRecord.id} ${result.message.replace(`${targetRecord.id} `, '').replace('。', '')}`,
          detail: payload.note || `已对差异单 ${targetRecord.id} 执行 ${payload.action} 处理动作。`,
          createdAt: payload.updatedAt,
          relatedPath: '/reconciliation',
        });

        return result;
      },
    }),
    [addLog, batches, records],
  );

  return <ReconciliationContext.Provider value={value}>{children}</ReconciliationContext.Provider>;
}

export function useReconciliation() {
  const context = useContext(ReconciliationContext);

  if (!context) {
    throw new Error('useReconciliation 必须在 ReconciliationProvider 内部使用');
  }

  return context;
}
