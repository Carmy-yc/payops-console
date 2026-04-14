import { Checkbox, Form, Input, Modal, Space, Typography } from 'antd';
import { useEffect, useMemo } from 'react';
import type { CheckboxOptionType } from 'antd/es/checkbox';
import type { PermissionKey } from '../../../shared/constants/permissions';
import type { CreateRolePayload, PermissionDefinition, RoleRecord, UpdateRolePayload } from '../types';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

type RoleEditorMode = 'clone' | 'edit';

type RoleEditorFormValues = {
  name: string;
  code: string;
  description?: string;
  permissionKeys: PermissionKey[];
};

type RoleEditorModalProps = {
  open: boolean;
  mode: RoleEditorMode;
  role: RoleRecord;
  permissionDefinitions: PermissionDefinition[];
  initialName: string;
  initialCode: string;
  onCancel: () => void;
  onSubmit: (values: CreateRolePayload | UpdateRolePayload) => void;
};

const moduleLabelMap: Record<PermissionDefinition['module'], string> = {
  dashboard: '图表看板',
  transaction: '交易',
  refund: '退款',
  reconciliation: '对账',
  risk: '风控',
  audit: '审计',
  'access-control': '访问控制',
};

function buildGroupedOptions(permissionDefinitions: PermissionDefinition[]) {
  return permissionDefinitions.reduce<
    Array<{
      module: PermissionDefinition['module'];
      label: string;
      options: CheckboxOptionType[];
    }>
  >((groups, permission) => {
    const matchedGroup = groups.find((group) => group.module === permission.module);

    if (matchedGroup) {
      matchedGroup.options.push({
        label: `${permission.label}（${permission.key}）`,
        value: permission.key,
      });
      return groups;
    }

    groups.push({
      module: permission.module,
      label: moduleLabelMap[permission.module],
      options: [
        {
          label: `${permission.label}（${permission.key}）`,
          value: permission.key,
        },
      ],
    });
    return groups;
  }, []);
}

type PermissionGroupSelectorProps = {
  groups: Array<{
    module: PermissionDefinition['module'];
    label: string;
    options: CheckboxOptionType[];
  }>;
  permissionDefinitions: PermissionDefinition[];
  value?: PermissionKey[];
  onChange?: (value: PermissionKey[]) => void;
};

function PermissionGroupSelector({
  groups,
  permissionDefinitions,
  value = [],
  onChange,
}: PermissionGroupSelectorProps) {
  const permissionOrderMap = useMemo(
    () => new Map(permissionDefinitions.map((permission, index) => [permission.key, index])),
    [permissionDefinitions],
  );

  return (
    <div>
      {groups.map((group) => {
        const groupPermissionKeys = group.options.map((option) => option.value as PermissionKey);
        const selectedGroupKeys = groupPermissionKeys.filter((key) => value.includes(key));

        return (
          <div key={group.module} style={{ marginBottom: 16 }}>
            <Text strong>{group.label}</Text>
            <div style={{ marginTop: 8 }}>
              <Checkbox.Group
                options={group.options}
                value={selectedGroupKeys}
                onChange={(nextValues) => {
                  const nextSelectedKeys = Array.from(
                    new Set([
                      ...value.filter((key) => !groupPermissionKeys.includes(key)),
                      ...(nextValues as PermissionKey[]),
                    ]),
                  ).sort(
                    (left, right) =>
                      (permissionOrderMap.get(left) ?? 0) - (permissionOrderMap.get(right) ?? 0),
                  );

                  onChange?.(nextSelectedKeys);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RoleEditorModal({
  open,
  mode,
  role,
  permissionDefinitions,
  initialName,
  initialCode,
  onCancel,
  onSubmit,
}: RoleEditorModalProps) {
  const [form] = Form.useForm<RoleEditorFormValues>();
  const groupedOptions = useMemo(
    () => buildGroupedOptions(permissionDefinitions),
    [permissionDefinitions],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    form.setFieldsValue({
      name: initialName,
      code: initialCode,
      description: role.description ?? undefined,
      permissionKeys: [...role.permissionKeys],
    });
  }, [form, initialCode, initialName, open, role]);

  return (
    <Modal
      title={mode === 'clone' ? `复制角色：${role.name}` : `编辑角色：${role.name}`}
      open={open}
      width={760}
      okText={mode === 'clone' ? '创建副本' : '保存修改'}
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Space direction="vertical" size={16} className="full-width">
        <Paragraph type="secondary">
          {mode === 'clone'
            ? '系统角色和自定义角色都可以复制成新的自定义角色，再按需要调整权限。'
            : '当前只允许编辑自定义角色，系统角色请先复制后再调整。'}
        </Paragraph>

        <Form<RoleEditorFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) =>
            onSubmit({
              ...(mode === 'edit' ? { roleId: role.id } : {}),
              name: values.name.trim(),
              code: values.code.trim(),
              description: values.description?.trim() || undefined,
              landingPath: role.landingPath,
              permissionKeys: values.permissionKeys,
            })
          }
        >
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="例如：夜班运营" />
          </Form.Item>

          <Form.Item label="角色编码" name="code" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input placeholder="例如：ops_night" />
          </Form.Item>

          <Form.Item label="角色说明" name="description">
            <TextArea rows={3} placeholder="可选，补充这个角色适用的职责范围" />
          </Form.Item>

          <Form.Item
            label="权限配置"
            name="permissionKeys"
            rules={[
              {
                validator: async (_, value: string[] | undefined) => {
                  if (value?.length) {
                    return;
                  }

                  throw new Error('请至少选择一个权限');
                },
              },
            ]}
          >
            <PermissionGroupSelector
              groups={groupedOptions}
              permissionDefinitions={permissionDefinitions}
            />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
}
