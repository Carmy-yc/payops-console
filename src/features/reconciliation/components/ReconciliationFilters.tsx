import { Button, Card, Col, Form, Input, Row, Select, Space, Typography } from 'antd';
import { useEffect } from 'react';
import {
  reconciliationDiffTypeOptions,
  reconciliationStatusOptions,
} from '../lib/reconciliation-utils';
import type { ReconciliationFilters as ReconciliationFiltersValue } from '../types';

type BatchOption = {
  label: string;
  value: string;
};

type ReconciliationFiltersProps = {
  defaultValues: ReconciliationFiltersValue;
  batchOptions: BatchOption[];
  onSearch: (values: ReconciliationFiltersValue) => void;
  onReset: () => void;
};

const { Text } = Typography;

export function ReconciliationFilters({
  defaultValues,
  batchOptions,
  onSearch,
  onReset,
}: ReconciliationFiltersProps) {
  const [form] = Form.useForm<ReconciliationFiltersValue>();

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [defaultValues, form]);

  return (
    <Card>
      <Space direction="vertical" size={16} className="full-width">
        <Text strong>筛选条件</Text>
        <Form<ReconciliationFiltersValue>
          form={form}
          layout="vertical"
          onFinish={(values) =>
            onSearch({
              batchDate: values.batchDate || defaultValues.batchDate,
              keyword: values.keyword?.trim() || undefined,
              diffType: values.diffType || undefined,
              status: values.status || undefined,
            })
          }
        >
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item label="对账批次" name="batchDate">
                <Select options={batchOptions} placeholder="请选择批次" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="关键字" name="keyword">
                <Input placeholder="支持差异单号 / 订单号 / 商户名称" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="差异类型" name="diffType">
                <Select allowClear placeholder="全部类型" options={reconciliationDiffTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="处理状态" name="status">
                <Select allowClear placeholder="全部状态" options={reconciliationStatusOptions} />
              </Form.Item>
            </Col>
            <Col span={4} className="reconciliation-filters__actions">
              <Form.Item label=" " className="reconciliation-filters__action-item">
                <Space>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      form.setFieldsValue(defaultValues);
                      onReset();
                    }}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Space>
    </Card>
  );
}
