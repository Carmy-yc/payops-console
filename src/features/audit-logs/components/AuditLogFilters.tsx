import { Button, Col, DatePicker, Form, Input, Row, Select, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { FilterPanel, FilterPanelActions } from '../../../shared/ui/FilterPanel';
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

export function AuditLogFilters({ onSearch, onReset }: AuditLogFiltersProps) {
  const [form] = Form.useForm<AuditLogFiltersFormValue>();
  const [expanded, setExpanded] = useState(false);

  return (
    <FilterPanel>
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
          <Col span={7}>
            <Form.Item label="关键字" name="keyword">
              <Input placeholder="支持对象编号 / 摘要 / 详情" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="操作人" name="operator">
              <Input placeholder="例如：周雅宁" />
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
          <FilterPanelActions span={5}>
            <Space wrap>
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
              <Button type="link" onClick={() => setExpanded((value) => !value)}>
                {expanded ? '收起' : '展开'}
              </Button>
            </Space>
          </FilterPanelActions>
        </Row>

        {expanded ? (
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item label="执行结果" name="result">
                <Select allowClear placeholder="全部结果" options={auditResultOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="操作时间" name="dateRange">
                <RangePicker className="full-width" />
              </Form.Item>
            </Col>
          </Row>
        ) : null}
      </Form>
    </FilterPanel>
  );
}
