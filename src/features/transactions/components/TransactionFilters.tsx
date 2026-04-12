import { Button, Col, Form, Input, InputNumber, Row, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import { FilterPanel, FilterPanelActions } from '../../../shared/ui/FilterPanel';
import type { TransactionFilters as TransactionFiltersValue } from '../types';

const { Text } = Typography;

type TransactionFiltersProps = {
  filteredCount: number;
  totalCount: number;
  onSearch: (values: TransactionFiltersValue) => void;
  onReset: () => void;
};

const statusOptions = [
  { label: '待支付', value: 'created' },
  { label: '已支付', value: 'paid' },
  { label: '退款中', value: 'refunding' },
  { label: '已退款', value: 'refunded' },
  { label: '支付失败', value: 'failed' },
  { label: '已关闭', value: 'closed' },
];

const channelOptions = [
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '银行卡', value: 'card' },
  { label: '钱包余额', value: 'wallet' },
];

const riskLevelOptions = [
  { label: '正常', value: 'none' },
  { label: '低风险', value: 'low' },
  { label: '中风险', value: 'medium' },
  { label: '高风险', value: 'high' },
];

function normalizeFilters(values: TransactionFiltersValue): TransactionFiltersValue {
  return {
    keyword: values.keyword?.trim() || undefined,
    status: values.status,
    payChannel: values.payChannel,
    riskLevel: values.riskLevel,
    amountMin: typeof values.amountMin === 'number' ? values.amountMin : undefined,
    amountMax: typeof values.amountMax === 'number' ? values.amountMax : undefined,
    createdFrom: values.createdFrom || undefined,
    createdTo: values.createdTo || undefined,
  };
}

export function TransactionFilters({
  filteredCount,
  totalCount,
  onSearch,
  onReset,
}: TransactionFiltersProps) {
  const [form] = Form.useForm<TransactionFiltersValue>();
  const [expanded, setExpanded] = useState(false);

  return (
    <FilterPanel
      className="transaction-filters"
      extra={
        <Text type="secondary">
          当前命中 {filteredCount} / {totalCount} 条订单
        </Text>
      }
    >
      <Form<TransactionFiltersValue>
        form={form}
        layout="vertical"
        onFinish={(values) => onSearch(normalizeFilters(values))}
      >
        <Row gutter={16}>
          <Col span={7}>
            <Form.Item label="关键字" name="keyword">
              <Input placeholder="支持订单号 / 商户名称 / 交易标题" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="订单状态" name="status">
              <Select allowClear placeholder="全部状态" options={statusOptions} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="支付渠道" name="payChannel">
              <Select allowClear placeholder="全部渠道" options={channelOptions} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="风险等级" name="riskLevel">
              <Select allowClear placeholder="全部风险" options={riskLevelOptions} />
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
              <Form.Item label="最小金额" name="amountMin">
                <InputNumber<number>
                  min={0}
                  precision={2}
                  placeholder="0"
                  className="full-width"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="最大金额" name="amountMax">
                <InputNumber<number>
                  min={0}
                  precision={2}
                  placeholder="不限"
                  className="full-width"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="开始日期" name="createdFrom">
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="结束日期" name="createdTo">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
        ) : null}
      </Form>
    </FilterPanel>
  );
}
