import { Button, Popconfirm, Space, Table } from 'antd';
import type { TableProps } from 'antd';
import { Link } from 'react-router-dom';
import { formatAmount, formatDateTime } from '../../transactions/lib/transaction-utils';
import type { RefundRecord } from '../../transactions/types';
import { RefundStatusTag, ReviewStatusTag } from '../../transactions/components/TransactionTags';

export type RefundTableRow = RefundRecord & {
  merchantName: string;
};

type RefundsTableProps = {
  data: RefundTableRow[];
  canApprove: boolean;
  onApprove: (refundId: string) => void;
  onReject: (refundId: string) => void;
  onMarkSuccess: (refundId: string) => void;
};

export function RefundsTable({
  data,
  canApprove,
  onApprove,
  onReject,
  onMarkSuccess,
}: RefundsTableProps) {
  const columns: TableProps<RefundTableRow>['columns'] = [
    {
      title: '退款单号',
      dataIndex: 'id',
      width: 160,
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      width: 170,
      render: (value: string) => <Link to={`/transactions/${value}`}>{value}</Link>,
    },
    {
      title: '商户名称',
      dataIndex: 'merchantName',
      width: 160,
    },
    {
      title: '退款金额',
      dataIndex: 'amount',
      width: 120,
      render: (value: number) => formatAmount(value),
    },
    {
      title: '退款原因',
      dataIndex: 'reason',
    },
    {
      title: '退款状态',
      dataIndex: 'status',
      width: 120,
      render: (value: RefundRecord['status']) => <RefundStatusTag status={value} />,
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      width: 120,
      render: (value: RefundRecord['reviewStatus']) => <ReviewStatusTag status={value} />,
    },
    {
      title: '发起时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space wrap>
          {record.reviewStatus === 'pending' && canApprove ? (
            <>
              <Popconfirm title="确认通过这笔退款审核吗？" onConfirm={() => onApprove(record.id)}>
                <Button type="link">通过</Button>
              </Popconfirm>
              <Popconfirm title="确认驳回这笔退款吗？" onConfirm={() => onReject(record.id)}>
                <Button type="link" danger>
                  驳回
                </Button>
              </Popconfirm>
            </>
          ) : null}

          {record.status === 'processing' && canApprove ? (
            <Popconfirm title="确认将这笔退款标记为成功吗？" onConfirm={() => onMarkSuccess(record.id)}>
              <Button type="link">标记成功</Button>
            </Popconfirm>
          ) : null}

          {!canApprove && record.reviewStatus === 'pending' ? <span>待财务审核</span> : null}
        </Space>
      ),
    },
  ];

  return (
    <Table<RefundTableRow>
      rowKey="id"
      columns={columns}
      dataSource={data}
      scroll={{ x: 1480 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
      }}
      locale={{
        emptyText: '暂无符合条件的退款记录',
      }}
    />
  );
}

