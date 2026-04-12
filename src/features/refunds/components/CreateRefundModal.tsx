import { Alert, Form, Input, InputNumber, Modal, Select, Space, Typography } from 'antd';
import { useEffect } from 'react';

const { Paragraph, Text } = Typography;

type CreateRefundFormValues = {
  amount: number;
  reason: string;
  remark?: string;
};

type CreateRefundModalProps = {
  open: boolean;
  orderId: string;
  maxRefundableAmount: number;
  reviewThreshold: number;
  onCancel: () => void;
  onSubmit: (values: CreateRefundFormValues) => void;
};

const refundReasonOptions = [
  { label: '用户取消订单', value: '用户取消订单' },
  { label: '库存回滚失败', value: '库存回滚失败' },
  { label: '服务履约异常', value: '服务履约异常' },
  { label: '运营补偿', value: '运营补偿' },
];

export function CreateRefundModal({
  open,
  orderId,
  maxRefundableAmount,
  reviewThreshold,
  onCancel,
  onSubmit,
}: CreateRefundModalProps) {
  const [form] = Form.useForm<CreateRefundFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open]);

  return (
    <Modal
      title="发起退款"
      open={open}
      okText="提交退款"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Space direction="vertical" size={16} className="full-width">
        <Alert
          type="info"
          showIcon
          message={`订单 ${orderId} 当前最多可退 ${maxRefundableAmount.toFixed(2)} 元`}
          description={`单笔退款金额大于等于 ${reviewThreshold} 元时，会进入财务审核流程。`}
        />

        <Form<CreateRefundFormValues>
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{
            reason: refundReasonOptions[0]?.value,
          }}
        >
          <Form.Item label="退款金额" name="amount" rules={[{ required: true, message: '请输入退款金额' }]}>
            <InputNumber<number>
              min={0.01}
              max={maxRefundableAmount}
              precision={2}
              className="full-width"
              placeholder="请输入退款金额"
            />
          </Form.Item>

          <Form.Item label="退款原因" name="reason" rules={[{ required: true, message: '请选择退款原因' }]}>
            <Select options={refundReasonOptions} />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={4} placeholder="可选，补充说明退款背景或处理备注" maxLength={120} />
          </Form.Item>
        </Form>

        <Paragraph type="secondary" className="refund-modal__tip">
          <Text strong>规则说明：</Text> 小额退款会直接进入处理中；大额退款会先进入待审核。
        </Paragraph>
      </Space>
    </Modal>
  );
}

