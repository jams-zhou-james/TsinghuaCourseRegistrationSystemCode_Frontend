// src/pages/UserManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { UserInfo } from 'Plugins/UserService/Objects/UserInfo';
import { UserRole, userRoleList } from 'Plugins/UserService/Objects/UserRole';
import { Token } from 'Plugins/AuthService/Objects/Token';
import WithRoleBasedSidebarLayout from "../../Layouts/WithRoleBasedSidebarLayout";
import BackgroundLayout from '../../Layouts/BackgroundLayout';
import { 
  Button, 
  Table, 
  Select, 
  Modal, 
  Form, 
  Input, 
  message 
} from 'antd';

// 假设有全局获取管理员Token的方法
declare function getAdminToken(): Token;
const userRole: UserRole = UserRole.superAdmin; // 假设当前用户是超级管理员

export const userManagementPagePath = '/admin/user-management';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [form] = Form.useForm();

  // 获取所有用户（无后端时用模拟数据）
  const fetchUsers = async () => {
    setLoading(true);
    // 模拟数据
    const mockUsers: UserInfo[] = [
      new UserInfo('1', 'student01', '', UserRole.student, '张三'),
      new UserInfo('2', 'teacher01', '', UserRole.teacher, '李老师'),
      new UserInfo('3', 'student02', '', UserRole.student, '王五'),
      new UserInfo('4', 'teacher02', '', UserRole.teacher, '赵老师'),
    ];
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = () => {
    form.validateFields().then(values => {
      const adminToken = getAdminToken();
      // 这里应该是实际的API调用
      message.success(editUser ? '用户信息已更新' : '用户创建成功');
      setShowModal(false);
      fetchUsers();
    }).catch(err => {
      console.error('验证失败:', err);
    });
  };

  const handleDelete = (user: UserInfo) => {
    Modal.confirm({
      title: '确认删除用户',
      content: `确定要删除用户 ${user.name} 吗？`,
      onOk: () => {
        const adminToken = getAdminToken();
        // 这里应该是实际的API调用
        message.success('用户已删除');
        fetchUsers();
      },
    });
  };

  const openEdit = (user: UserInfo) => {
    setEditUser(user);
    form.setFieldsValue({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditUser(null);
    form.resetFields();
    setShowModal(true);
  };

  const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'userID',
      key: 'userID',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserInfo) => (
        <>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <WithRoleBasedSidebarLayout role={UserRole.superAdmin}>
      <BackgroundLayout
        gradient="linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
        contentMaxWidth="90%"
        contentStyle={{ maxWidth: 1200 }}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 24, color: '#1e40af' }}>用户管理</h2>
            <div>
              <Button type="primary" onClick={openAdd} style={{ marginRight: 16 }}>
                新增用户
              </Button>
              <Select
                value={roleFilter}
                onChange={(value) => setRoleFilter(value as UserRole | '')}
                style={{ width: 150 }}
                placeholder="筛选角色"
              >
                <Select.Option value="">全部角色</Select.Option>
                {userRoleList.filter(r => r !== UserRole.superAdmin).map(role => (
                  <Select.Option key={role} value={role}>
                    {role}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="userID"
            loading={loading}
            bordered
            style={{ background: '#fff' }}
          />

          <Modal
            title={editUser ? '编辑用户' : '新增用户'}
            open={showModal}
            onOk={handleSave}
            onCancel={() => setShowModal(false)}
            width={600}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input disabled={!!editUser} />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: !editUser, message: '请输入密码' },
                  { min: 6, message: '密码至少6位' },
                ]}
              >
                <Input.Password placeholder={editUser ? '不修改请留空' : ''} />
              </Form.Item>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select>
                  {userRoleList.filter(r => r !== UserRole.superAdmin).map(role => (
                    <Select.Option key={role} value={role}>
                      {role}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </BackgroundLayout>
    </WithRoleBasedSidebarLayout>
  );
};

export default UserManagementPage;