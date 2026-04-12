import type { PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import { mockAuditLogs } from '../data/mock-audit-logs';
import type { AuditLogRecord, CreateAuditLogPayload } from '../types';

type AuditContextValue = {
  logs: AuditLogRecord[];
  addLog: (payload: CreateAuditLogPayload) => AuditLogRecord;
};

const AuditContext = createContext<AuditContextValue | null>(null);

function formatId() {
  return `AL${new Date().toISOString().slice(0, 10).replaceAll('-', '')}${Date.now().toString().slice(-6)}`;
}

export function AuditProvider({ children }: PropsWithChildren) {
  const [logs, setLogs] = useState<AuditLogRecord[]>(mockAuditLogs);

  const value = useMemo<AuditContextValue>(
    () => ({
      logs,
      addLog(payload) {
        const entry: AuditLogRecord = {
          id: formatId(),
          ...payload,
        };

        setLogs((previous) => [entry, ...previous]);
        return entry;
      },
    }),
    [logs],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const context = useContext(AuditContext);

  if (!context) {
    throw new Error('useAudit 必须在 AuditProvider 内部使用');
  }

  return context;
}
