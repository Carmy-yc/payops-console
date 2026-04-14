import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { RoleRecord, UserRecord, UserStatus } from '../types';

type UserEditorMode = 'create' | 'edit';

type UserEditorFormValues = {
  account: string;
  name: string;
  password?: string;
  roleId: string;
  status: UserStatus;
};

type UserEditorModalProps = {
  open: boolean;
  mode: UserEditorMode;
  roles: RoleRecord[];
  user?: UserRecord;
  onCancel: () => void;
  onSubmit: (values: UserEditorFormValues) => void;
};

const statusOptions: Array<{ label: string; value: UserStatus }> = [
  { label: '启用中', value: 'active' },
  { label: '已停用', value: 'disabled' },
];

export function UserEditorModal({
  open,
  mode,
  roles,
  user,
  onCancel,
  onSubmit,
}: UserEditorModalProps) {
  const [form] = Form.useForm<UserEditorFormValues>();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === 'edit' && user) {
      form.setFieldsValue({
        account: user.account,
        name: user.name,
        roleId: user.roleId,
        status: user.status,
      });
      return;
    }

    form.setFieldsValue({
      account: '',
      name: '',
      password: '',
      roleId: roles[0]?.id,
      status: 'active',
    });
  }, [form, mode, open, roles, user]);

  return (
    <Modal
      title={mode === 'create' ? '新建用户' : '编辑用户'}
      open={open}
      okText={mode === 'create' ? '创建用户' : '保存修改'}
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnHidden
    >
      <Form<UserEditorFormValues> form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item label="账号" name="account" rules={[{ required: true, message: '请输入账号' }]}>
          <Input placeholder="例如：ops-east" disabled={mode === 'edit'} />
        </Form.Item>

        <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input placeholder="例如：李书宁" />
        </Form.Item>

        {mode === 'create' ? (
          <Form.Item
            label="初始密码"
            name="password"
            rules={[{ required: true, message: '请输入初始密码' }]}
          >
            <Input.Password placeholder="请输入初始密码" />
          </Form.Item>
        ) : null}

        <Form.Item label="角色" name="roleId" rules={[{ required: true, message: '请选择角色' }]}>
          <Select
            options={roles.map((role) => ({
              label: role.name,
              value: role.id,
            }))}
            placeholder="请选择角色"
          />
        </Form.Item>

        <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
          <Select options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
