import type {
  AuditActionType,
  AuditLogFilters,
  AuditLogRecord,
  AuditLogSummary,
  AuditModule,
  AuditResult,
} from '../types';

type LabelConfig = {
  label: string;
  color: 'default' | 'processing' | 'warning' | 'success' | 'error';
};

export const auditModuleConfig: Record<AuditModule, LabelConfig> = {
  auth: {
    label: '登录鉴权',
    color: 'processing',
  },
  refund: {
    label: '退款管理',
    color: 'warning',
  },
  reconciliation: {
    label: '对账中心',
    color: 'success',
  },
  risk: {
    label: '风险告警',
    color: 'error',
  },
  access_control: {
    label: '访问控制',
    color: 'processing',
  },
};

export const auditResultConfig: Record<AuditResult, LabelConfig> = {
  success: {
    label: '成功',
    color: 'success',
  },
  failed: {
    label: '失败',
    color: 'error',
  },
};

export const auditActionConfig: Record<AuditActionType, { label: string; module: AuditModule }> = {
  login: {
    label: '登录',
    module: 'auth',
  },
  logout: {
    label: '退出登录',
    module: 'auth',
  },
  refund_create: {
    label: '发起退款',
    module: 'refund',
  },
  refund_approve: {
    label: '退款审核通过',
    module: 'refund',
  },
  refund_reject: {
    label: '退款驳回',
    module: 'refund',
  },
  refund_success: {
    label: '退款成功',
    module: 'refund',
  },
  reconciliation_resolve: {
    label: '标记已平',
    module: 'reconciliation',
  },
  reconciliation_review: {
    label: '转人工复核',
    module: 'reconciliation',
  },
  reconciliation_ignore: {
    label: '忽略差异',
    module: 'reconciliation',
  },
  risk_resolve: {
    label: '标记已处理',
    module: 'risk',
  },
  risk_review: {
    label: '升级人工审核',
    module: 'risk',
  },
  risk_dismiss: {
    label: '标记误报',
    module: 'risk',
  },
  user_create: {
    label: '创建用户',
    module: 'access_control',
  },
  user_update: {
    label: '编辑用户',
    module: 'access_control',
  },
  user_enable: {
    label: '启用用户',
    module: 'access_control',
  },
  user_disable: {
    label: '停用用户',
    module: 'access_control',
  },
  role_clone: {
    label: '复制角色',
    module: 'access_control',
  },
  role_update: {
    label: '编辑角色',
    module: 'access_control',
  },
  role_delete: {
    label: '删除角色',
    module: 'access_control',
  },
};

export const auditModuleOptions = Object.entries(auditModuleConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export const auditActionOptions = Object.entries(auditActionConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export const auditResultOptions = Object.entries(auditResultConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function filterAuditLogs(logs: AuditLogRecord[], filters: AuditLogFilters) {
  const keyword = filters.keyword?.trim().toLowerCase();
  const operator = filters.operator?.trim().toLowerCase();

  return logs.filter((log) => {
    if (keyword) {
      const matchedKeyword = [log.targetId, log.targetLabel, log.summary, log.detail]
        .join(' ')
        .toLowerCase()
        .includes(keyword);

      if (!matchedKeyword) {
        return false;
      }
    }

    if (operator && !log.actorName.toLowerCase().includes(operator)) {
      return false;
    }

    if (filters.module && log.module !== filters.module) {
      return false;
    }

    if (filters.actionType && log.actionType !== filters.actionType) {
      return false;
    }

    if (filters.result && log.result !== filters.result) {
      return false;
    }

    const logDate = log.createdAt.slice(0, 10);

    if (filters.dateFrom && logDate < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && logDate > filters.dateTo) {
      return false;
    }

    return true;
  });
}

export function summarizeAuditLogs(logs: AuditLogRecord[]): AuditLogSummary {
  return {
    totalCount: logs.length,
    successCount: logs.filter((log) => log.result === 'success').length,
    failedCount: logs.filter((log) => log.result === 'failed').length,
    moduleCount: new Set(logs.map((log) => log.module)).size,
  };
}
