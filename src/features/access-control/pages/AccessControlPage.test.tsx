import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../../../app/providers/AppProviders';
import { storeAuthSession } from '../../../tests/test-auth-utils';
import { AccessControlPage } from './AccessControlPage';

describe('AccessControlPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('会渲染访问控制页，并支持停用用户', async () => {
    storeAuthSession('admin');

    render(
      <AppProviders>
        <MemoryRouter>
          <AccessControlPage />
        </MemoryRouter>
      </AppProviders>,
    );

    expect(screen.getByText('访问控制')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '用户管理' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '角色管理' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '权限字典' })).toBeInTheDocument();

    const userRow = screen.getByText('陈晓彤').closest('tr');

    if (!(userRow instanceof HTMLElement)) {
      throw new Error('未找到用户行');
    }

    expect(within(userRow).getByText('启用中')).toBeInTheDocument();

    fireEvent.click(within(userRow).getByRole('button', { name: '停用' }));

    await waitFor(() => {
      expect(within(userRow).getByText('已停用')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: '权限字典' }));

    expect(await screen.findByText('查看图表看板')).toBeInTheDocument();
    expect(screen.getByText('access-control:view')).toBeInTheDocument();
  });

  it('支持复制角色、编辑权限并删除未绑定的自定义角色', async () => {
    storeAuthSession('admin');

    render(
      <AppProviders>
        <MemoryRouter>
          <AccessControlPage />
        </MemoryRouter>
      </AppProviders>,
    );

    fireEvent.click(screen.getByRole('tab', { name: '角色管理' }));

    const rolePanel = screen.getByRole('tabpanel', { name: '角色管理' });
    const opsRow = await within(rolePanel).findByText('运营人员');
    const sourceRow = opsRow.closest('tr');

    if (!(sourceRow instanceof HTMLElement)) {
      throw new Error('未找到运营角色行');
    }

    fireEvent.click(within(sourceRow).getByRole('button', { name: '复制' }));

    const cloneDialog = await screen.findByRole('dialog', { name: '复制角色：运营人员' });
    fireEvent.change(within(cloneDialog).getByLabelText('角色名称'), {
      target: { value: '运营支持组' },
    });
    fireEvent.change(within(cloneDialog).getByLabelText('角色编码'), {
      target: { value: 'ops_support' },
    });
    fireEvent.click(within(cloneDialog).getByRole('button', { name: '创建副本' }));

    const customRoleRowText = await within(rolePanel).findByText('运营支持组');
    const customRoleRow = customRoleRowText.closest('tr');

    if (!(customRoleRow instanceof HTMLElement)) {
      throw new Error('未找到复制后的自定义角色');
    }

    expect(within(customRoleRow).getByText('自定义角色')).toBeInTheDocument();

    fireEvent.click(within(customRoleRow).getByRole('button', { name: '编辑权限' }));

    const editDialog = await screen.findByRole('dialog', { name: '编辑角色：运营支持组' });
    fireEvent.click(within(editDialog).getByLabelText('查看图表看板（dashboard:view）'));
    fireEvent.click(within(editDialog).getByRole('button', { name: '保存修改' }));

    await waitFor(() => {
      expect(within(customRoleRow).getByText('5 项')).toBeInTheDocument();
    });

    fireEvent.click(within(customRoleRow).getByRole('button', { name: '删除' }));

    await waitFor(() => {
      expect(screen.queryByText('运营支持组')).not.toBeInTheDocument();
    });
  });
});
