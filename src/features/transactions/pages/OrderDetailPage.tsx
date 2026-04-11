import { useParams } from 'react-router-dom';
import { PagePlaceholder } from '../../../shared/ui/PagePlaceholder';

export function OrderDetailPage() {
  const { orderId } = useParams();

  return (
    <PagePlaceholder
      title="订单详情"
      badge={orderId ?? '订单号'}
      description="这里会展示订单基础信息、状态时间线、退款记录、风险标签和操作日志。"
    />
  );
}

