import { Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/store/AuthProvider';
import { RefundStats } from '../components/RefundStats';
import { RefundsFilters, type RefundsFiltersValue } from '../components/RefundsFilters';
import { RefundsTable } from '../components/RefundsTable';
import { useRefunds } from '../store/RefundsProvider';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { usePageMessage } from '../../../shared/hooks/usePageMessage';

const { Paragraph, Title } = Typography;

export function RefundsPage() {
  const [filters, setFilters] = useState<RefundsFiltersValue>({});
  const { refunds, orders, approveRefund, rejectRefund, markRefundSuccess } = useRefunds();
  const { currentUser } = useAuth();
  const { contextHolder, showResult } = usePageMessage();

  const canApprove = Boolean(currentUser?.permissions.includes(PERMISSIONS.refundApprove));

  const refundRows = useMemo(() => {
    const orderMap = new Map(orders.map((order) => [order.id, order]));

    return refunds
      .map((refund) => ({
        ...refund,
        merchantName: orderMap.get(refund.orderId)?.merchantName ?? '未知商户',
      }))
      .filter((refund) => {
        const keyword = filters.keyword?.toLowerCase();

        if (keyword) {
          const matchedKeyword = [refund.id, refund.orderId, refund.merchantName]
            .join(' ')
            .toLowerCase()
            .includes(keyword);

          if (!matchedKeyword) {
            return false;
          }
        }

        if (filters.status && refund.status !== filters.status) {
          return false;
        }

        if (filters.reviewStatus && refund.reviewStatus !== filters.reviewStatus) {
          return false;
        }

        return true;
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }, [filters, orders, refunds]);

  return (
    <Space direction="vertical" size={16} className="full-width">
      {contextHolder}

      <div>
        <Title level={3}>退款管理</Title>
        <Paragraph type="secondary">
          这一页承接订单详情页发起的退款请求，支持查看退款状态、审核大额退款，以及模拟退款完成后的状态流转。
        </Paragraph>
      </div>

      <RefundStats refunds={refunds} />

      <RefundsFilters
        onSearch={(values) => setFilters(values)}
        onReset={() => setFilters({})}
      />

      <RefundsTable
        data={refundRows}
        canApprove={canApprove}
        onApprove={(refundId) => {
          const result = approveRefund(refundId, currentUser?.name ?? '财务人员');
          showResult(result);
        }}
        onReject={(refundId) => {
          const result = rejectRefund(refundId, currentUser?.name ?? '财务人员');
          showResult(result);
        }}
        onMarkSuccess={(refundId) => {
          const result = markRefundSuccess(refundId, currentUser?.name ?? '支付网关');
          showResult(result);
        }}
      />
    </Space>
  );
}
