// src/pages/UserManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { UserInfo } from 'Plugins/UserAccountService/Objects/UserInfo';
import { UserRole, userRoleList } from 'Plugins/UserAccountService/Objects/UserRole';
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
import { getUserToken } from 'Globals/GlobalStore';
import { QueryAllUsersMessage } from 'Plugins/UserAccountService/APIs/QueryAllUsersMessage';
import { CreateUserAccountMessage } from 'Plugins/UserAccountService/APIs/CreateUserAccountMessage';
import { UpdateUserAccountMessage } from 'Plugins/UserAccountService/APIs/UpdateUserAccountMessage';

export const userManagementPagePath = '/admin/user-management';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [form] = Form.useForm();

  // 获取所有用户
  const fetchUsers = async () => {
    setLoading(true);
    const adminToken = getUserToken();
    
    if (!adminToken) {
      message.error('管理员令牌无效，请重新登录');
      setLoading(false);
      return;
    }

    try {
      // 获取所有角色的用户
      const allUsers: UserInfo[] = [];
      const roles = [UserRole.student, UserRole.teacher];
      
      for (const role of roles) {
        await new Promise<void>((resolve, reject) => {
          new QueryAllUsersMessage(adminToken, role).send(
            (response: string) => {
              try {
                const userData = JSON.parse(response);
                if (Array.isArray(userData)) {
                  allUsers.push(...userData.map((user: any) => 
                    new UserInfo(user.userID, user.userName, user.accountName, user.password, user.role)
                  ));
                }
                resolve();
              } catch (err) {
                console.error('解析用户数据失败:', err);
                reject(err);
              }
            },
            (error: string) => {
              console.error('获取用户列表失败:', error);
              reject(new Error(error));
            }
          );
        });
      }
      
      setUsers(allUsers);
      message.success('用户数据加载成功');
    } catch (error: any) {
      message.error('获取用户列表失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = () => {
    form.validateFields().then(values => {
      const adminToken = getUserToken();
      
      if (!adminToken) {
        message.error('管理员令牌无效，请重新登录');
        return;
      }

      if (editUser) {
        // 编辑用户逻辑
        const { accountName, password, userName, role } = values;
        
        // 如果账户名发生变更，先检查新账户名是否已存在
        if (accountName !== editUser.accountName) {
          const existingUser = users.find(u => u.accountName === accountName && u.userID !== editUser.userID);
          if (existingUser) {
            message.error(`账户名 "${accountName}" 已存在，请使用其他账户名`);
            return;
          }
        }
        
        // 调用UpdateUserAccountMessage接口更新用户信息
        new UpdateUserAccountMessage(
          adminToken,
          editUser.userID,
          userName !== editUser.userName ? userName : null,
          accountName !== editUser.accountName ? accountName : null, // 账户名变更时传入新账户名，否则传null
          password ? password : null
        ).send(
          (response: string) => {
            try {
              const updatedUser = JSON.parse(response);
              console.log('用户信息更新成功:', updatedUser);
              
              // 更新本地状态
              const updatedUsers = users.map(user => 
                user.userID === editUser.userID 
                  ? new UserInfo(updatedUser.userID, updatedUser.userName, updatedUser.accountName, updatedUser.password, updatedUser.role)
                  : user
              );
              setUsers(updatedUsers);
              
              if (accountName !== editUser.accountName) {
                message.success(`账户名已更新：${editUser.accountName} → ${accountName}`);
              } else {
                message.success('用户信息已更新');
              }
              setShowModal(false);
            } catch (err) {
              console.error('解析更新用户数据失败:', err);
              message.error('更新用户信息失败');
            }
          },
          (error: string) => {
            message.error('更新用户失败: ' + error);
          }
        );
        
      } else {
        // 创建新用户
        const { accountName, password, userName, role } = values;
        
        // 检查账户名是否已存在
        const existingUser = users.find(u => u.accountName === accountName);
        if (existingUser) {
          message.error(`账户名 "${accountName}" 已存在，请使用其他账户名`);
          return;
        }
        
        new CreateUserAccountMessage(
          adminToken,
          userName,
          accountName,
          password,
          role
        ).send(
          (response: string) => {
            try {
              const newUser = JSON.parse(response);
              console.log('用户创建成功:', newUser);
              
              setUsers([...users, new UserInfo(newUser.userID, newUser.userName, newUser.accountName, newUser.password, newUser.role)]);
              message.success('用户创建成功');
              setShowModal(false);
            } catch (err) {
              console.error('解析新用户数据失败:', err);
              message.error('创建用户失败');
            }
          },
          (error: string) => {
            message.error('创建用户失败: ' + error);
          }
        );
      }
    }).catch(err => {
      console.error('验证失败:', err);
    });
  };

  // 删除用户功能已移除

  const openEdit = (user: UserInfo) => {
    setEditUser(user);
    form.setFieldsValue({
      accountName: user.accountName,
      password: '',
      userName: user.userName,
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
      title: '账户名',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
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
        <Button type="link" onClick={() => openEdit(record)}>
          编辑
        </Button>
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
                name="accountName"
                label="账户名"
                rules={[{ required: true, message: '请输入账户名' }]}
              >
                <Input />
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
                name="userName"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select disabled={!!editUser}>
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