import type { PropsWithChildren } from 'react';
import { ConfigProvider, theme } from 'antd';
import { AuditProvider } from '../../features/audit-logs/store/AuditProvider';
import { AuthProvider } from '../../features/auth/store/AuthProvider';
import { RefundsProvider } from '../../features/refunds/store/RefundsProvider';
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
        <AuthProvider>
          <RefundsProvider>{children}</RefundsProvider>
        </AuthProvider>
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
