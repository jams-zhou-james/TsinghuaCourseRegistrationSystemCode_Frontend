// src/Pages/LoginPage.tsx
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { setUserToken } from 'Globals/GlobalStore';
import { UserLoginMessage } from 'Plugins/UserAuthService/APIs/UserLoginMessage';
import { Button, Form, Input, message as antdMessage } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import BackgroundLayout from '../Layouts/BackgroundLayout';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { studentCourseListPagePath } from './Student/CourseListPage';
import { teacherCourseListPagePath } from './Teacher/CourseListPage';
import { userManagementPagePath } from './Admin/UserManagementPage';

export const loginPagePath = '/login';

const studentHomePagePath = studentCourseListPagePath
const teacherHomePagePath = teacherCourseListPagePath;
const adminHomePagePath = userManagementPagePath;

// 自定义错误处理方法
const customErrorHandler = (error: string) => {
  // 从错误信息中提取更友好的提示
  if (error.includes('账号不存在')) {
    antdMessage.error('用户名或密码错误');
  } else if (error.includes('密码错误')) {
    antdMessage.error('用户名或密码错误');
  } else {
    antdMessage.error('登录失败: ' + error);
  }
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

 // 修改后的handleLogin函数
const handleLogin = async (values: any) => {
  setLoading(true);
  const { username, password } = values;
  
  try {
    new UserLoginMessage(username, password).send(
      async (info: string) => {
        try {
          const token = JSON.parse(info);
          setUserToken(token);
          
          // 获取用户安全信息
          const userInfo = await new Promise<any>((resolve, reject) => {
            new QuerySafeUserInfoByTokenMessage(token).send(
              (info: string) => {
                try {
                  const data = JSON.parse(info);
                  console.log('Received user info data:', data);
                  if (!data) {
                    reject(new Error('用户信息格式不正确'));
                    return;
                  }
                  resolve(data);
                } catch (e) {
                  reject(e);
                }
              },
              (error: string) => {
                customErrorHandler(error);
                reject(error);
              }
            );
          });

          console.log('User info:', userInfo);

          if (!userInfo || !userInfo.role) {
            throw new Error('用户信息中缺少角色信息');
          }

          // 根据用户角色跳转不同页面
          switch (userInfo.role as UserRole) {
            case UserRole.student:
              history.push(studentHomePagePath);
              break;
            case UserRole.teacher:
              history.push(teacherHomePagePath);
              break;
            case UserRole.superAdmin:
              history.push(adminHomePagePath);
              break;
            default:
              throw new Error('未知的用户角色');
          }
        } catch (err: any) {
          console.error('Error getting user info:', err);
          antdMessage.error('获取用户信息失败: ' + (err.message || '未知错误'));
          setLoading(false); // 确保这里也重置loading
        }
      },
      (error: string) => {
        customErrorHandler(error);
        setLoading(false); // 登录失败时重置loading
      }
    );
  } catch (err: any) {
    setLoading(false);
    antdMessage.error(err.message || '登录失败');
  }
};

  return (
    <BackgroundLayout>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px 0 #a78bfa55',
          marginBottom: 24,
          marginTop: 8,
        }}
      >
        <UserOutlined style={{ fontSize: 48, color: '#fff' }} />
      </div>
      <h1
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: '#7c3aed',
          textShadow: '0 2px 8px #a78bfa33',
          marginBottom: 8,
          textAlign: 'center',
          letterSpacing: 2,
        }}
      >
        清华大学选课系统
      </h1>
      <Form
        onFinish={handleLogin}
        style={{ width: '100%', marginTop: 24 }}
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#a78bfa' }} />}
            placeholder="用户名"
            size="large"
            style={{
              borderRadius: 18,
              border: '2px solid #c4b5fd',
              padding: '12px 16px',
              fontSize: 16,
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#a78bfa' }} />}
            placeholder="密码"
            size="large"
            style={{
              borderRadius: 18,
              border: '2px solid #c4b5fd',
              padding: '12px 16px',
              fontSize: 16,
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loading}
            block
            style={{
              height: 48,
              borderRadius: 18,
              background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </BackgroundLayout>
  );
}