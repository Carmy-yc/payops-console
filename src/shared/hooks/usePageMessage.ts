import { message } from 'antd';

type PageMessageType = 'success' | 'error';

type PageMessageResult = {
  success: boolean;
  message: string;
};

export function usePageMessage() {
  const [messageApi, contextHolder] = message.useMessage();

  function show(type: PageMessageType, content: string) {
    messageApi.open({
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
