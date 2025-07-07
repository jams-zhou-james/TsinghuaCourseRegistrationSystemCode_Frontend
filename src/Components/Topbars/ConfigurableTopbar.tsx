import React, { useState } from 'react';
import { Popover, Button, Spin, ConfigProvider } from 'antd';
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { Permissions } from 'Plugins/SemesterPhaseService/Objects/Permissions';

export interface TopbarThemeConfig {
  background: string;
  color: string;
  buttonBg: string;
  buttonColor: string;
  popoverBg: string;
  popoverColor: string;
}

interface ConfigurableTopbarProps {
  userToken: string;
  theme: TopbarThemeConfig;
}

// 只声明为 Partial<Record<string, string>>，避免类型报错
const permissionLabels: Partial<Record<string, string>> = {
  allowTeacherManage: '教师管理',
  allowStudentSelect: '学生选课',
  allowStudentDrop: '学生退课',
  allowStudentEvaluate: '学生评价',
};

export const ConfigurableTopbar: React.FC<ConfigurableTopbarProps> = ({ userToken, theme }) => {
  const [phaseLoading, setPhaseLoading] = useState(false);
  const [phaseInfo, setPhaseInfo] = useState<SemesterPhase | null>(null);
  const [phaseError, setPhaseError] = useState<string | null>(null);

  const [userLoading, setUserLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<SafeUserInfo | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  const handlePhaseVisibleChange = (visible: boolean) => {
    if (visible && !phaseInfo && !phaseLoading) {
      setPhaseLoading(true);
      setPhaseError(null);
      new QuerySemesterPhaseStatusMessage(userToken).send(
        (info: string) => {
          try {
            const data = JSON.parse(info);
            setPhaseInfo(new SemesterPhase(data.currentPhase, data.permissions));
          } catch (e) {
            setPhaseError('解析学期阶段信息失败');
          }
          setPhaseLoading(false);
        },
        (err: string) => {
          setPhaseError(err || '获取学期阶段失败');
          setPhaseLoading(false);
        }
      );
    }
  };

  const handleUserVisibleChange = (visible: boolean) => {
    if (visible && !userInfo && !userLoading) {
      setUserLoading(true);
      setUserError(null);
      new QuerySafeUserInfoByTokenMessage(userToken).send(
        (info: string) => {
          try {
            const data = JSON.parse(info);
            setUserInfo(new SafeUserInfo(data.userID, data.userName, data.accountName, data.role));
          } catch (e) {
            setUserError('解析用户信息失败');
          }
          setUserLoading(false);
        },
        (err: string) => {
          setUserError(err || '获取用户信息失败');
          setUserLoading(false);
        }
      );
    }
  };

  const renderPhaseContent = () => {
    if (phaseLoading) return <Spin size="small" />;
    if (phaseError) return <div style={{ color: 'red', padding: 12 }}>{phaseError}</div>;
    if (!phaseInfo) return <div style={{ padding: 12 }}>暂无数据</div>;
    return (
      <div className="custom-popover-content">
        <div><b>当前阶段：</b> {phaseInfo.currentPhase}</div>
        <div style={{ marginTop: 8 }}><b>权限：</b></div>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {Object.entries(phaseInfo.permissions).map(([key, value]) => (
            <li key={key} style={{ color: value ? '#52c41a' : '#d9d9d9' }}>
              {permissionLabels[key as keyof Permissions]}：{value ? '允许' : '禁止'}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderUserContent = () => {
    if (userLoading) return <Spin size="small" />;
    if (userError) return <div style={{ color: 'red', padding: 12 }}>{userError}</div>;
    if (!userInfo) return <div style={{ padding: 12 }}>暂无数据</div>;
    return (
      <div className="custom-popover-content">
        <div><b>姓名：</b>{userInfo.userName}</div>
        <div><b>用户名：</b>{userInfo.accountName}</div>
        <div><b>身份：</b>{userInfo.role}</div>
        <div><b>ID：</b>{userInfo.userID}</div>
      </div>
    );
  };

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Button: {
              colorPrimary: theme.buttonBg,
              colorText: theme.buttonColor,
              defaultBg: theme.buttonBg,
              defaultColor: theme.buttonColor,
              borderRadius: 8,
            },
            Popover: {
              colorBgElevated: theme.popoverBg,
              colorText: theme.popoverColor,
              colorPrimary: theme.popoverBg,
              colorTextHeading: theme.popoverColor,
              colorTextLabel: theme.popoverColor,
              colorLink: theme.popoverColor,
              colorLinkHover: theme.popoverColor,
              colorLinkActive: theme.popoverColor,
            },
          },
        }}
      >
        <div style={{
          width: '100%',
          height: 56,
          background: theme.background,
          color: theme.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 32px',
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px #0001',
          zIndex: 10,
        }}>
          <Popover
            content={renderPhaseContent}
            trigger="hover"
            onOpenChange={handlePhaseVisibleChange}
            placement="bottomRight"
            overlayStyle={{
              backgroundColor: theme.popoverBg,
              color: theme.popoverColor,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Button
              className="custom-topbar-btn"
              style={{
                marginRight: 16,
                background: theme.buttonBg,
                color: theme.buttonColor,
                border: 'none',
                borderRadius: 8,
                transition: 'all 0.2s',
                fontWeight: 'bold',
              }}
              type="default"
            >
              当前状态
            </Button>
          </Popover>
          <Popover
            content={renderUserContent}
            trigger="hover"
            onOpenChange={handleUserVisibleChange}
            placement="bottomRight"
            overlayStyle={{
              backgroundColor: theme.popoverBg,
              color: theme.popoverColor,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Button
              className="custom-topbar-btn"
              style={{
                background: theme.buttonBg,
                color: theme.buttonColor,
                border: 'none',
                borderRadius: 8,
                transition: 'all 0.2s',
                fontWeight: 'bold',
              }}
              type="default"
            >
              个人信息
            </Button>
          </Popover>
        </div>
      </ConfigProvider>
      <style>{`
        .custom-popover-content {
          background: ${theme.popoverBg} !important;
          color: ${theme.popoverColor} !important;
          border-radius: 8px !important;
          padding: 12px !important;
          min-width: 180px;
        }
        .custom-popover-content b {
          color: ${theme.popoverColor} !important;
        }
        .custom-topbar-btn {
          background: ${theme.buttonBg} !important;
          color: ${theme.buttonColor} !important;
        }
        .custom-topbar-btn:hover, .custom-topbar-btn:focus {
          background: ${theme.popoverBg} !important;
          color: ${theme.popoverColor} !important;
        }
      `}</style>
    </>
  );
};

export default ConfigurableTopbar;
