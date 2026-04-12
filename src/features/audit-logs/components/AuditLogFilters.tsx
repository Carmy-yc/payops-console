import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import {
  auditActionOptions,
  auditModuleOptions,
  auditResultOptions,
} from '../lib/audit-log-utils';
import type { AuditLogFilters as AuditLogFiltersValue } from '../types';

type AuditLogFiltersProps = {
  onSearch: (values: AuditLogFiltersValue) => void;
  onReset: () => void;
};

type AuditLogFiltersFormValue = AuditLogFiltersValue & {
  dateRange?: [Dayjs, Dayjs];
};

const { RangePicker } = DatePicker;
const { Text } = Typography;

export function AuditLogFilters({ onSearch, onReset }: AuditLogFiltersProps) {
  const [form] = Form.useForm<AuditLogFiltersFormValue>();

  return (
    <Card>
      <Space direction="vertical" size={16} className="full-width">
        <Text strong>筛选条件</Text>
        <Form<AuditLogFiltersFormValue>
          form={form}
          layout="vertical"
          onFinish={(values) =>
            onSearch({
              keyword: values.keyword?.trim() || undefined,
              operator: values.operator?.trim() || undefined,
              module: values.module || undefined,
              actionType: values.actionType || undefined,
              result: values.result || undefined,
              dateFrom: values.dateRange?.[0]?.format('YYYY-MM-DD'),
              dateTo: values.dateRange?.[1]?.format('YYYY-MM-DD'),
            })
          }
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="关键字" name="keyword">
                <Input placeholder="支持对象编号 / 摘要 / 详情" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="操作人" name="operator">
                <Input placeholder="例如：财务同学" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="所属模块" name="module">
                <Select allowClear placeholder="全部模块" options={auditModuleOptions} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="动作类型" name="actionType">
                <Select allowClear placeholder="全部动作" options={auditActionOptions} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="执行结果" name="result">
                <Select allowClear placeholder="全部结果" options={auditResultOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="操作时间" name="dateRange">
                <RangePicker className="full-width" />
              </Form.Item>
            </Col>
            <Col span={4} className="audit-log-filters__actions">
              <Form.Item label=" " className="audit-log-filters__action-item">
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
