export type AuditModule =
  | 'auth'
  | 'refund'
  | 'reconciliation'
  | 'risk'
  | 'access_control';

export type AuditResult = 'success' | 'failed';

export type AuditActionType =
  | 'login'
  | 'logout'
  | 'refund_create'
  | 'refund_approve'
  | 'refund_reject'
  | 'refund_success'
  | 'reconciliation_resolve'
  | 'reconciliation_review'
  | 'reconciliation_ignore'
  | 'risk_resolve'
  | 'risk_review'
  | 'risk_dismiss'
  | 'user_create'
  | 'user_update'
  | 'user_enable'
  | 'user_disable'
  | 'role_clone'
  | 'role_update'
  | 'role_delete';

export type AuditTargetType =
  | 'session'
  | 'refund'
  | 'reconciliation'
  | 'risk'
  | 'order'
  | 'user'
  | 'role';

export type AuditLogRecord = {
  id: string;
  actorName: string;
  actorRole: string;
  module: AuditModule;
  actionType: AuditActionType;
  targetType: AuditTargetType;
  targetId: string;
  targetLabel?: string;
  result: AuditResult;
  summary: string;
  detail: string;
  createdAt: string;
  relatedPath?: string;
};

export type AuditLogFilters = {
  keyword?: string;
  operator?: string;
  module?: AuditModule;
  actionType?: AuditActionType;
  result?: AuditResult;
  dateFrom?: string;
  dateTo?: string;
};

export type AuditLogSummary = {
  totalCount: number;
  successCount: number;
  failedCount: number;
  moduleCount: number;
};

export type CreateAuditLogPayload = Omit<AuditLogRecord, 'id'>;
