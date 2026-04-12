import { message } from 'antd';
import { useEffect, useState } from 'react';

type PageMessageType = 'success' | 'error';

type PageMessageResult = {
  success: boolean;
  message: string;
};

export function usePageMessage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [pendingMessage, setPendingMessage] = useState<{
    type: PageMessageType;
    content: string;
  } | null>(null);

  useEffect(() => {
    if (!pendingMessage) {
      return;
    }

    messageApi.open(pendingMessage);
    setPendingMessage(null);
  }, [messageApi, pendingMessage]);

  function show(type: PageMessageType, content: string) {
    setPendingMessage({
      type,
      content,
    });
  }

  function success(content: string) {
    show('success', content);
  }

  function error(content: string) {
    show('error', content);
  }

  function showResult(result: PageMessageResult) {
    if (result.success) {
      success(result.message);
      return;
    }

    error(result.message);
  }

  return {
    contextHolder,
    show,
    success,
    error,
    showResult,
  };
}
