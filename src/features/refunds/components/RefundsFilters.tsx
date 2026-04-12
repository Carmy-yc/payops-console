import { Button, Col, Form, Input, Row, Select, Space } from 'antd';
import { FilterPanel, FilterPanelActions } from '../../../shared/ui/FilterPanel';

type RefundsFiltersValue = {
  keyword?: string;
  status?: string;
  reviewStatus?: string;
};

type RefundsFiltersProps = {
  onSearch: (values: RefundsFiltersValue) => void;
  onReset: () => void;
};

const refundStatusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '退款成功', value: 'success' },
  { label: '退款失败', value: 'failed' },
  { label: '已驳回', value: 'rejected' },
];

const reviewStatusOptions = [
  { label: '免审核', value: 'not_required' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
];

export type { RefundsFiltersValue };

export function RefundsFilters({ onSearch, onReset }: RefundsFiltersProps) {
  const [form] = Form.useForm<RefundsFiltersValue>();

  return (
    <FilterPanel>
      <Form<RefundsFiltersValue>
        form={form}
        layout="vertical"
        onFinish={(values) =>
          onSearch({
            keyword: values.keyword?.trim() || undefined,
            status: values.status || undefined,
            reviewStatus: values.reviewStatus || undefined,
          })
        }
      >
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item label="关键字" name="keyword">
              <Input placeholder="支持退款单号 / 订单号 / 商户名称" />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="退款状态" name="status">
              <Select allowClear placeholder="全部状态" options={refundStatusOptions} />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label="审核状态" name="reviewStatus">
              <Select allowClear placeholder="全部审核状态" options={reviewStatusOptions} />
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
