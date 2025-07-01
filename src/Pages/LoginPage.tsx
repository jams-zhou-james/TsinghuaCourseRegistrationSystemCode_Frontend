// src/Pages/LoginPage.tsx
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { setUserToken } from 'Globals/GlobalStore';
import { UserLoginMessage } from 'Plugins/UserAuthService/APIs/UserLoginMessage';
import { Button, Form, Input, message as antdMessage } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import BackgroundLayout from '../Layouts/BackgroundLayout';

export const loginPagePath = '/login';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      new UserLoginMessage(username, password).send((info: string) => {
        const token = JSON.parse(info);
        setUserToken(token);
        setLoading(false);
        // history.push(courseListPagePath);
      });
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