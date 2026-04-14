import type { PropsWithChildren } from 'react';
import { ConfigProvider, theme } from 'antd';
import { AccessControlProvider } from '../../features/access-control/store/AccessControlProvider';
import { AuditProvider } from '../../features/audit-logs/store/AuditProvider';
import { AuthProvider } from '../../features/auth/store/AuthProvider';
import { ReconciliationProvider } from '../../features/reconciliation/store/ReconciliationProvider';
import { RefundsProvider } from '../../features/refunds/store/RefundsProvider';
import { RiskAlertsProvider } from '../../features/risk-alerts/store/RiskAlertsProvider';
import { ThemeProvider, useThemeSetting } from './ThemeProvider';

function AppConfigProviders({ children }: PropsWithChildren) {
  const { resolvedTheme } = useThemeSetting();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 12,
        },
      }}
    >
      <AuditProvider>
        <AccessControlProvider>
          <AuthProvider>
            <RefundsProvider>
              <ReconciliationProvider>
                <RiskAlertsProvider>{children}</RiskAlertsProvider>
              </ReconciliationProvider>
            </RefundsProvider>
          </AuthProvider>
        </AccessControlProvider>
      </AuditProvider>
    </ConfigProvider>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AppConfigProviders>{children}</AppConfigProviders>
    </ThemeProvider>
  );
}
