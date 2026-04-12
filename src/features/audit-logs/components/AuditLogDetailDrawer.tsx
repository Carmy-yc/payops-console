import { Descriptions, Drawer, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../transactions/lib/transaction-utils';
import {
  auditActionConfig,
  auditModuleConfig,
  auditResultConfig,
} from '../lib/audit-log-utils';
import type { AuditLogRecord } from '../types';

type AuditLogDetailDrawerProps = {
  open: boolean;
  record?: AuditLogRecord;
  onClose: () => void;
};

const { Paragraph, Text, Title } = Typography;

export function AuditLogDetailDrawer({ open, record, onClose }: AuditLogDetailDrawerProps) {
  return (
    <Drawer open={open} width={560} title="审计日志详情" onClose={onClose} destroyOnHidden>
      {record ? (
        <Space direction="vertical" size={16} className="full-width">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="日志号">{record.id}</Descriptions.Item>
            <Descriptions.Item label="操作时间">{formatDateTime(record.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="操作人">{record.actorName}</Descriptions.Item>
            <Descriptions.Item label="角色">{record.actorRole}</Descriptions.Item>
            <Descriptions.Item label="所属模块">
              <Tag color={auditModuleConfig[record.module].color}>
                {auditModuleConfig[record.module].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="动作类型">
              {auditActionConfig[record.actionType].label}
            </Descriptions.Item>
            <Descriptions.Item label="执行结果">
              <Tag color={auditResultConfig[record.result].color}>
                {auditResultConfig[record.result].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="关联对象">
              {record.relatedPath ? (
                <Link to={record.relatedPath}>{record.targetId}</Link>
              ) : (
                <Text>{record.targetId}</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="对象说明">{record.targetLabel || '--'}</Descriptions.Item>
            <Descriptions.Item label="操作摘要">{record.summary}</Descriptions.Item>
          </Descriptions>

          <div>
            <Title level={5}>详细说明</Title>
            <Paragraph>{record.detail}</Paragraph>
          </div>
        </Space>
      ) : null}
    </Drawer>
  );
}
