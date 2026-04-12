import { Button, Card, Col, Form, Input, Row, Select, Space, Typography } from 'antd';
import {
  riskAlertStatusOptions,
  riskAlertTypeOptions,
  riskLevelOptions,
} from '../lib/risk-alert-utils';
import type { RiskAlertFilters as RiskAlertFiltersValue } from '../types';

type RiskAlertFiltersProps = {
  onSearch: (values: RiskAlertFiltersValue) => void;
  onReset: () => void;
};

const { Text } = Typography;

export function RiskAlertFilters({ onSearch, onReset }: RiskAlertFiltersProps) {
  const [form] = Form.useForm<RiskAlertFiltersValue>();

  return (
    <Card>
      <Space direction="vertical" size={16} className="full-width">
        <Text strong>筛选条件</Text>
        <Form<RiskAlertFiltersValue>
          form={form}
          layout="vertical"
          onFinish={(values) =>
            onSearch({
              keyword: values.keyword?.trim() || undefined,
              riskLevel: values.riskLevel || undefined,
              alertType: values.alertType || undefined,
              status: values.status || undefined,
            })
          }
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="关键字" name="keyword">
                <Input placeholder="支持告警号 / 订单号 / 商户名称" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="风险等级" name="riskLevel">
                <Select allowClear placeholder="全部等级" options={riskLevelOptions} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="告警类型" name="alertType">
                <Select allowClear placeholder="全部类型" options={riskAlertTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="处理状态" name="status">
                <Select allowClear placeholder="全部状态" options={riskAlertStatusOptions} />
              </Form.Item>
            </Col>
            <Col span={4} className="risk-alert-filters__actions">
              <Form.Item label=" " className="risk-alert-filters__action-item">
                <Space>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button
                    onClick={() => {
                      form.resetFields();
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
