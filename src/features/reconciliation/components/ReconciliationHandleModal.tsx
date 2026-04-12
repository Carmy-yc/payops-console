import { Descriptions, Form, Input, Modal, Select, Typography } from 'antd';
import { useEffect } from 'react';
import { formatAmount } from '../../transactions/lib/transaction-utils';
import {
  getReconciliationActionOptions,
  reconciliationDiffTypeConfig,
  reconciliationStatusConfig,
} from '../lib/reconciliation-utils';
import type { ReconciliationHandleAction, ReconciliationRecord } from '../types';

type ReconciliationHandleModalProps = {
  open: boolean;
  record?: ReconciliationRecord;
  onCancel: () => void;
  onSubmit: (values: { action: ReconciliationHandleAction; note?: string }) => void;
};

type HandleFormValue = {
  action: ReconciliationHandleAction;
  note?: string;
};

const { Text } = Typography;

function renderDiffAmount(value: number) {
  const absoluteAmount = formatAmount(Math.abs(value));
  return value > 0 ? `+${absoluteAmount}` : value < 0 ? `-${absoluteAmount}` : absoluteAmount;
}

export function ReconciliationHandleModal({
  open,
  record,
  onCancel,
  onSubmit,
}: ReconciliationHandleModalProps) {
  const [form] = Form.useForm<HandleFormValue>();
  const actionOptions = getReconciliationActionOptions(record?.status);

  useEffect(() => {
    if (!record) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      action: actionOptions[0]?.value,
      note: record.note,
    });
  }, [actionOptions, form, record]);

  return (
    <Modal
      open={open}
      title="处理差异订单"
      width={640}
      destroyOnHidden
      forceRender
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="确认处理"
      cancelText="取消"
    >
      {record ? (
        <Descriptions column={2} size="small" bordered className="reconciliation-handle__summary">
          <Descriptions.Item label="差异单号">{record.id}</Descriptions.Item>
          <Descriptions.Item label="关联订单">{record.orderId}</Descriptions.Item>
          <Descriptions.Item label="差异类型">
            {reconciliationDiffTypeConfig[record.diffType].label}
          </Descriptions.Item>
          <Descriptions.Item label="当前状态">
            {reconciliationStatusConfig[record.status].label}
          </Descriptions.Item>
          <Descriptions.Item label="平台金额">{formatAmount(record.internalAmount)}</Descriptions.Item>
          <Descriptions.Item label="渠道金额">{formatAmount(record.channelAmount)}</Descriptions.Item>
          <Descriptions.Item label="差异金额" span={2}>
            <Text type="danger">{renderDiffAmount(record.diffAmount)}</Text>
          </Descriptions.Item>
        </Descriptions>
      ) : null}

      <Form<HandleFormValue>
        form={form}
        layout="vertical"
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
          <Input.TextArea rows={4} placeholder="可填写处理说明，便于后续审计和复盘" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
