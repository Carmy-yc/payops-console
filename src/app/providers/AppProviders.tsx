import type { PropsWithChildren } from 'react';
import { ConfigProvider, theme } from 'antd';
import { AuthProvider } from '../../features/auth/store/AuthProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 12,
        },
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </ConfigProvider>
  );
}

