import { Button, Descriptions, Drawer, Form, Input, Select, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  ChannelTag,
  RiskLevelTag,
  TransactionStatusTag,
} from '../../transactions/components/TransactionTags';
import { formatAmount, formatDateTime } from '../../transactions/lib/transaction-utils';
import {
  getRiskAlertActionOptions,
  riskAlertStatusConfig,
  riskAlertTypeConfig,
} from '../lib/risk-alert-utils';
import type { RiskAlertAction, RiskAlertRecord } from '../types';

type RiskAlertDetailDrawerProps = {
  open: boolean;
  record?: RiskAlertRecord;
  canHandle: boolean;
  onClose: () => void;
  onSubmit: (values: { action: RiskAlertAction; note?: string }) => void;
};

type HandleFormValue = {
  action: RiskAlertAction;
  note?: string;
};

const { Paragraph, Text, Title } = Typography;

export function RiskAlertDetailDrawer({
  open,
  record,
  canHandle,
  onClose,
  onSubmit,
}: RiskAlertDetailDrawerProps) {
  const [form] = Form.useForm<HandleFormValue>();
  const actionOptions = getRiskAlertActionOptions(record?.status);
  const canOperate = Boolean(record && canHandle && actionOptions.length > 0);

  return (
    <Drawer open={open} width={560} title="风险告警详情" onClose={onClose} destroyOnHidden>
      {record ? (
        <Space direction="vertical" size={16} className="full-width">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="告警号">{record.id}</Descriptions.Item>
            <Descriptions.Item label="关联订单">
              <Link to={`/transactions/${record.orderId}`}>{record.orderId}</Link>
            </Descriptions.Item>
            <Descriptions.Item label="商户名称">{record.merchantName}</Descriptions.Item>
            <Descriptions.Item label="订单信息">
              <Space wrap>
                <span>{record.subject}</span>
                <span>{formatAmount(record.amount)}</span>
                <ChannelTag channel={record.payChannel} />
                <TransactionStatusTag status={record.orderStatus} />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="风险画像">
              <Space wrap>
                <RiskLevelTag riskLevel={record.riskLevel} />
                <Tag color={riskAlertTypeConfig[record.alertType].color}>
                  {riskAlertTypeConfig[record.alertType].label}
                </Tag>
                <Text>风险分 {record.riskScore}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag color={riskAlertStatusConfig[record.status].color}>
                {riskAlertStatusConfig[record.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="命中规则">{record.ruleName}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{formatDateTime(record.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="最近处理时间">{formatDateTime(record.updatedAt)}</Descriptions.Item>
            <Descriptions.Item label="当前负责人">{record.owner || '--'}</Descriptions.Item>
            <Descriptions.Item label="历史备注">{record.note || '--'}</Descriptions.Item>
          </Descriptions>

          <div>
            <Title level={5}>告警说明</Title>
            <Paragraph>{record.description}</Paragraph>
            <Text type="secondary">处置建议：{record.suggestion}</Text>
          </div>

          {canOperate ? (
            <Form<HandleFormValue>
              form={form}
              layout="vertical"
              initialValues={{
                action: actionOptions[0]?.value,
                note: record.note,
              }}
              onFinish={(values) =>
                onSubmit({
                  action: values.action,
                  note: values.note?.trim() || undefined,
                })
              }
            >
              <Form.Item label="处理动作" name="action" rules={[{ required: true, message: '请选择处理动作' }]}>
                <Select options={actionOptions} placeholder="请选择处理动作" />
              </Form.Item>
              <Form.Item label="处理备注" name="note">
                <Input.TextArea rows={4} placeholder="可记录核验结果或后续跟进说明" />
              </Form.Item>
              <Space>
                <Button type="primary" onClick={() => form.submit()}>
                  确认处理
                </Button>
                <Button onClick={onClose}>关闭</Button>
              </Space>
            </Form>
          ) : (
            <Text type="secondary">
              {canHandle ? '当前告警已处理完成。' : '当前账号只有查看权限，不能执行风控处置动作。'}
            </Text>
          )}
        </Space>
      ) : null}
    </Drawer>
  );
}
