import type {
  ReconciliationActionPayload,
  ReconciliationActionResult,
  ReconciliationBatch,
  ReconciliationDiffType,
  ReconciliationFilters,
  ReconciliationHandleAction,
  ReconciliationRecord,
  ReconciliationStatus,
  ReconciliationSummary,
} from '../types';

type LabelConfig = {
  label: string;
  color: 'default' | 'processing' | 'warning' | 'success' | 'error';
};

type ActionConfig = {
  label: string;
  nextStatus: ReconciliationStatus;
  successMessage: string;
};

type ActionOption = {
  value: ReconciliationHandleAction;
  label: string;
};

const openStatuses: ReconciliationStatus[] = ['pending', 'processing'];
const pendingActions: ReconciliationHandleAction[] = ['resolve', 'review', 'ignore'];
const processingActions: ReconciliationHandleAction[] = ['resolve', 'ignore'];

export const reconciliationDiffTypeConfig: Record<ReconciliationDiffType, LabelConfig> = {
  amount_mismatch: {
    label: '支付金额不一致',
    color: 'warning',
  },
  channel_missing: {
    label: '渠道流水缺失',
    color: 'error',
  },
  refund_mismatch: {
    label: '退款金额不一致',
    color: 'processing',
  },
  fee_mismatch: {
    label: '手续费不一致',
    color: 'default',
  },
};

export const reconciliationStatusConfig: Record<ReconciliationStatus, LabelConfig> = {
  pending: {
    label: '待处理',
    color: 'warning',
  },
  processing: {
    label: '人工复核中',
    color: 'processing',
  },
  resolved: {
    label: '已对平',
    color: 'success',
  },
  ignored: {
    label: '已忽略',
    color: 'default',
  },
};

export const reconciliationActionConfig: Record<ReconciliationHandleAction, ActionConfig> = {
  resolve: {
    label: '标记已平',
    nextStatus: 'resolved',
    successMessage: '已标记为已对平',
  },
  review: {
    label: '转人工复核',
    nextStatus: 'processing',
    successMessage: '已转人工复核',
  },
  ignore: {
    label: '忽略差异',
    nextStatus: 'ignored',
    successMessage: '已忽略该差异',
  },
};

export const reconciliationDiffTypeOptions = Object.entries(reconciliationDiffTypeConfig).map(
  ([value, config]) => ({
    value,
    label: config.label,
  }),
);

export const reconciliationStatusOptions = Object.entries(reconciliationStatusConfig).map(
  ([value, config]) => ({
    value,
    label: config.label,
  }),
);

export function getReconciliationActionOptions(status?: ReconciliationStatus): ActionOption[] {
  if (!status) {
    return [];
  }

  if (status === 'pending') {
    return pendingActions.map((value) => ({
      value,
      label: reconciliationActionConfig[value].label,
    }));
  }

  if (status === 'processing') {
    return processingActions.map((value) => ({
      value,
      label: reconciliationActionConfig[value].label,
    }));
  }

  return [];
}

export function filterReconciliationRecords(
  records: ReconciliationRecord[],
  filters: ReconciliationFilters,
) {
  const keyword = filters.keyword?.trim().toLowerCase();

  return records.filter((record) => {
    if (filters.batchDate && record.batchDate !== filters.batchDate) {
      return false;
    }

    if (keyword) {
      const matchedKeyword = [record.id, record.orderId, record.merchantName]
        .join(' ')
        .toLowerCase()
        .includes(keyword);

      if (!matchedKeyword) {
        return false;
      }
    }

    if (filters.diffType && record.diffType !== filters.diffType) {
      return false;
    }

    if (filters.status && record.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export function summarizeReconciliation(
  batch: ReconciliationBatch,
  records: ReconciliationRecord[],
): ReconciliationSummary {
  const openRecords = records.filter((record) => openStatuses.includes(record.status));
  const diffOrders = openRecords.length;
  const matchedOrders = Math.max(batch.totalOrders - diffOrders, 0);
  const diffAmount = openRecords.reduce((sum, record) => sum + Math.abs(record.diffAmount), 0);
  const pendingCount = records.filter((record) => record.status === 'pending').length;

  return {
    batchDate: batch.batchDate,
    totalOrders: batch.totalOrders,
    matchedOrders,
    diffOrders,
    diffAmount: Number(diffAmount.toFixed(2)),
    pendingCount,
  };
}

export function handleReconciliationAction(
  records: ReconciliationRecord[],
  payload: ReconciliationActionPayload,
): ReconciliationActionResult {
  const targetRecord = records.find((record) => record.id === payload.recordId);

  if (!targetRecord) {
    return {
      success: false,
      message: '未找到对应的差异记录。',
      records,
    };
  }

  if (!openStatuses.includes(targetRecord.status)) {
    return {
      success: false,
      message: '当前差异已处理，无需重复操作。',
      records,
    };
  }

  if (targetRecord.status === 'processing' && payload.action === 'review') {
    return {
      success: false,
      message: '当前差异已在人工复核中。',
      records,
    };
  }

  const actionConfig = reconciliationActionConfig[payload.action];
  const note = payload.note?.trim();

  return {
    success: true,
    message: `${targetRecord.id} ${actionConfig.successMessage}。`,
    records: records.map((record) =>
      record.id === payload.recordId
        ? {
            ...record,
            status: actionConfig.nextStatus,
            owner: payload.operator,
            note: note || record.note,
            updatedAt: payload.updatedAt,
          }
        : record,
    ),
  };
}
