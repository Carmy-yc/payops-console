import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/store/AuthProvider';
import { mockReconciliationRecords } from '../../reconciliation/data/mock-reconciliation-records';
import { mockRiskAlerts } from '../../risk-alerts/data/mock-risk-alerts';
import { useRefunds } from '../../refunds/store/RefundsProvider';
import { formatDateTime } from '../../transactions/lib/transaction-utils';
import { NAV_ITEMS } from '../../../shared/constants/routes';
import { DashboardChannelChart } from '../components/DashboardChannelChart';
import { DashboardIssueChart } from '../components/DashboardIssueChart';
import { DashboardTrendChart } from '../components/DashboardTrendChart';
import {
  buildDashboardChannelStats,
  buildDashboardExceptions,
  buildDashboardIssueStats,
  buildDashboardMetrics,
  buildDashboardTodoItems,
  buildDashboardTrendSeries,
} from '../lib/dashboard-utils';

const { Paragraph, Title } = Typography;

const quickLinkCopy: Record<string, string> = {
  transactions: '查看订单、定位问题并继续下钻详情。',
  refunds: '承接订单退款申请，跟进审核与结果。',
  reconciliation: '集中处理渠道差异与人工复核任务。',
  'risk-alerts': '查看风险命中、人工审核与处置结果。',
  'audit-logs': '回溯关键操作链路和责任归属。',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { orders, refunds } = useRefunds();

  const metrics = useMemo(
    () => buildDashboardMetrics(orders, refunds, mockReconciliationRecords, mockRiskAlerts),
    [orders, refunds],
  );

  const todoItems = useMemo(
    () => buildDashboardTodoItems(refunds, mockReconciliationRecords, mockRiskAlerts),
    [refunds],
  );

  const recentExceptions = useMemo(
    () => buildDashboardExceptions(refunds, mockReconciliationRecords, mockRiskAlerts),
    [refunds],
  );

  const trendSeries = useMemo(
    () =>
      buildDashboardTrendSeries(
        metrics.referenceDate,
        metrics.todayGrossAmount,
        metrics.todayOrderCount,
      ),
    [metrics.referenceDate, metrics.todayGrossAmount, metrics.todayOrderCount],
  );

  const channelStats = useMemo(
    () => buildDashboardChannelStats(orders, metrics.referenceDate),
    [metrics.referenceDate, orders],
  );

  const issueStats = useMemo(
    () =>
      buildDashboardIssueStats(
        metrics.openRefundCount,
        metrics.openReconciliationCount,
        metrics.openRiskCount,
      ),
    [metrics.openRefundCount, metrics.openReconciliationCount, metrics.openRiskCount],
  );

  const availableQuickLinks = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) =>
          item.key !== 'dashboard' &&
          item.permission &&
          currentUser?.permissions.includes(item.permission),
      ),
    [currentUser?.permissions],
  );

  const visibleTodoItems = useMemo(
    () =>
      todoItems.filter((item) => currentUser?.permissions.includes(item.permission)),
    [currentUser?.permissions, todoItems],
  );

  const visibleExceptions = useMemo(
    () =>
      recentExceptions.filter((item) => currentUser?.permissions.includes(item.permission)),
    [currentUser?.permissions, recentExceptions],
  );

  return (
    <Space direction="vertical" size={16} className="dashboard-page full-width">
      <div className="dashboard-page__header">
        <div>
          <Title level={3}>图表看板</Title>
          <Paragraph type="secondary" className="dashboard-page__description">
            首页聚合了今日核心指标、待处理事项、快捷入口和最近异常，便于
            {currentUser?.roleName ?? '当前角色'}
            直接从总览进入处理链路。
          </Paragraph>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message={`当前看板基于模拟业务日 ${metrics.referenceDate || '2026-04-12'} 汇总展示`}
        description="交易与退款指标会随着运行时操作刷新；风控与对账仍以当前 mock 数据作为演示基线。"
      />

      <div>
        <Title level={5}>今日核心指标</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} xl={6}>
            <Card className="dashboard-card dashboard-card--metric">
              <Statistic
                title="今日成功交易额"
                value={metrics.todayGrossAmount}
                precision={2}
                prefix="¥"
              />
              <Paragraph type="secondary" className="dashboard-card__caption">
                来自 {metrics.todaySuccessCount} 笔成功支付。
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12} xl={6}>
            <Card className="dashboard-card dashboard-card--metric">
              <Statistic
                title="今日支付成功率"
                value={metrics.todaySuccessRate}
                precision={1}
                suffix="%"
              />
              <Progress
                percent={metrics.todaySuccessRate}
                showInfo={false}
                strokeColor="#1677ff"
                className="dashboard-card__progress"
              />
              <Paragraph type="secondary" className="dashboard-card__caption">
                今日共进入 {metrics.todayOrderCount} 笔订单。
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12} xl={6}>
            <Card className="dashboard-card dashboard-card--metric">
              <Statistic
                title="今日退款申请额"
                value={metrics.todayRefundAmount}
                precision={2}
                prefix="¥"
              />
              <Paragraph type="secondary" className="dashboard-card__caption">
                新增 {metrics.todayRefundCount} 笔退款申请。
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12} xl={6}>
            <Card className="dashboard-card dashboard-card--metric">
              <Statistic title="待处理异常" value={metrics.openIssueCount} suffix="项" />
              <Paragraph type="secondary" className="dashboard-card__caption">
                退款 {metrics.openRefundCount} / 对账 {metrics.openReconciliationCount} / 风控{' '}
                {metrics.openRiskCount}
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card
            title="近 7 日交易趋势"
            extra={<Typography.Text type="secondary">最后一天随当前看板实时刷新</Typography.Text>}
            className="dashboard-card"
          >
            <DashboardTrendChart data={trendSeries} />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title="支付渠道分布"
            extra={<Typography.Text type="secondary">按当前业务日成功订单统计</Typography.Text>}
            className="dashboard-card"
          >
            {channelStats.length > 0 ? (
              <DashboardChannelChart
                data={channelStats}
                totalAmount={metrics.todayGrossAmount}
              />
            ) : (
              <Empty description="当前没有可展示的渠道分布" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card
            title="异常分布"
            extra={<Typography.Text type="secondary">快速定位当前积压最重的模块</Typography.Text>}
            className="dashboard-card"
          >
            <DashboardIssueChart data={issueStats} />
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card
            title="待处理事项"
            extra={<Typography.Text type="secondary">按当前角色权限展示</Typography.Text>}
            className="dashboard-card"
          >
            {visibleTodoItems.length > 0 ? (
              <List
                dataSource={visibleTodoItems}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button key={item.key} type="link" onClick={() => navigate(item.path)}>
                        去处理
                      </Button>,
                    ]}
                  >
                    <div className="dashboard-list-item">
                      <div className="dashboard-list-item__main">
                        <Space size={8}>
                          <Typography.Text strong>{item.title}</Typography.Text>
                          <Tag color={item.count > 0 ? 'warning' : 'default'}>{item.count} 项</Tag>
                        </Space>
                        <Paragraph type="secondary" className="dashboard-list-item__description">
                          {item.description}
                        </Paragraph>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="当前角色没有可展示的待办事项" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <Card
            title="快捷入口"
            extra={<Typography.Text type="secondary">快速进入常用链路</Typography.Text>}
            className="dashboard-card"
          >
            {availableQuickLinks.length > 0 ? (
              <div className="dashboard-shortcut-grid">
                {availableQuickLinks.map((item) => (
                  <Button
                    key={item.key}
                    block
                    className="dashboard-shortcut"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="dashboard-shortcut__copy">
                      <Typography.Text strong>{item.label}</Typography.Text>
                      <Typography.Text type="secondary">
                        {quickLinkCopy[item.key] ?? '进入对应模块继续处理业务。'}
                      </Typography.Text>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <Empty description="当前角色没有可访问的快捷入口" />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          <Card
            title="最近异常"
            extra={<Typography.Text type="secondary">优先关注最近进入待处理状态的问题</Typography.Text>}
            className="dashboard-card"
          >
            {visibleExceptions.length > 0 ? (
              <List
                dataSource={visibleExceptions}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button key={item.key} type="link" onClick={() => navigate(item.path)}>
                        查看详情
                      </Button>,
                    ]}
                  >
                    <div className="dashboard-exception">
                      <Space size={[8, 8]} wrap>
                        <Tag color={item.levelColor}>{item.moduleLabel}</Tag>
                        <Tag>{item.statusLabel}</Tag>
                        <Typography.Text strong>{item.title}</Typography.Text>
                      </Space>
                      <Paragraph type="secondary" className="dashboard-exception__summary">
                        {item.summary}
                      </Paragraph>
                      <Typography.Text type="secondary">
                        最近时间：{formatDateTime(item.occurredAt)}
                      </Typography.Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="当前没有需要优先关注的异常" />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
