
import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { getUserToken, setUserToken } from 'Globals/GlobalStore';
import { UserLogoutMessage } from 'Plugins/UserAuthService/APIs/UserLogoutMessage';
import { loginPagePath } from './LoginPage';
import { message as antdMessage } from 'antd';

export const logoutPagePath = '/logout';

export default function LogoutPage() {
  const history = useHistory();

  useEffect(() => {
    const token = getUserToken && getUserToken();
    if (!token) {
      // No token, just redirect
      setUserToken(undefined);
      history.replace(loginPagePath);
      return;
    }
    new UserLogoutMessage(token).send((info: string) => {
      try {
        const result = JSON.parse(info);
        if (result && result.success !== false) {
          antdMessage.success('登出成功');
        } else {
          antdMessage.warning('登出失败: ' + (result?.message || '未知错误'));
        }
      } catch (e) {
        antdMessage.warning('登出响应解析失败');
      }
      setUserToken(undefined);
      history.replace(loginPagePath);
    });
  }, [history]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <h2>正在登出...</h2>
    </div>
  );
}
