import { mockAuditLogs } from '../data/mock-audit-logs';
import { filterAuditLogs, summarizeAuditLogs } from './audit-log-utils';

describe('audit-log-utils', () => {
  it('会汇总审计日志统计数据', () => {
    const summary = summarizeAuditLogs(mockAuditLogs);

    expect(summary.totalCount).toBe(9);
    expect(summary.successCount).toBe(8);
    expect(summary.failedCount).toBe(1);
    expect(summary.moduleCount).toBe(4);
  });

  it('会按模块和结果筛选审计日志', () => {
    const logs = filterAuditLogs(mockAuditLogs, {
      module: 'refund',
      result: 'success',
    });

    expect(logs).toHaveLength(3);
    expect(logs.every((log) => log.module === 'refund')).toBe(true);
  });
});
