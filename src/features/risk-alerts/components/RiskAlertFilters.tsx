import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import { FilterPanel, FilterPanelActions } from '../../../shared/ui/FilterPanel';
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

export function RiskAlertFilters({ onSearch, onReset }: RiskAlertFiltersProps) {
  const [form] = Form.useForm<RiskAlertFiltersValue>();

  return (
    <FilterPanel>
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
          <FilterPanelActions span={4}>
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
          </FilterPanelActions>
        </Row>
      </Form>
    </FilterPanel>
  );
}
