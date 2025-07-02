// src/Pages/Admin/SystemSettingsPage.tsx

import React, { useState } from 'react';
import { Card, Switch, Button, Typography, Divider, message } from 'antd';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout from '../../Layouts/BackgroundLayout';
import { UserRole } from '../../Plugins/UserAccountService/Objects/UserRole';

export const systemSettingsPagePath = '/admin/system-settings';

const initialConfig = {
  phase: 1,
  allowTeacherEditCourse: false,
  allowStudentSelectCourse: false,
  allowStudentDropCourse: false,
  allowStudentEvaluate: false,
  lotteryDone: false,
};

interface SettingItem {
  label: string;
  key: keyof typeof initialConfig;
}

const SystemSettingsPage: React.FC = () => {
  const [config, setConfig] = useState(initialConfig);
  
  const updateConfig = (key: keyof typeof initialConfig, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    message.success('设置已更新（模拟）');
  };

  const handleLottery = () => {
    setConfig(prev => ({ ...prev, phase: 2, lotteryDone: true }));
    message.success('抽签完成，已进入阶段2（模拟）');
  };

  const canLottery =
    config.phase === 1 &&
    !config.allowTeacherEditCourse &&
    !config.allowStudentSelectCourse &&
    !config.allowStudentDropCourse &&
    !config.allowStudentEvaluate &&
    !config.lotteryDone;

  const settingItems: SettingItem[] = [
    { label: '允许老师创建/删除课程（组）', key: 'allowTeacherEditCourse' },
    { label: '允许学生选择课程', key: 'allowStudentSelectCourse' },
    { label: '允许学生退选课程', key: 'allowStudentDropCourse' },
    { label: '允许学生对课程评价', key: 'allowStudentEvaluate' }
  ];

  return (
    <DefaultLayout role={UserRole.superAdmin}>
      <BackgroundLayout 
        gradient="linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%)"
        contentMaxWidth={800}
        contentPadding={24}
        contentStyle={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <Card 
          title={<Typography.Title level={4} style={{ margin: 0 }}>系统设置</Typography.Title>}
          bordered={false}
          headStyle={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            padding: '0 16px',
            minHeight: 56
          }}
          bodyStyle={{ 
            padding: 16,
            background: 'transparent'
          }}
          style={{ 
            width: '100%', 
            boxShadow: 'none',
            background: 'transparent'
          }}
        >
          <Typography.Text strong style={{ display: 'block', marginBottom: 16 }}>
            当前阶段：{config.phase === 1 ? '阶段 1' : '阶段 2'}
          </Typography.Text>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 8,
            marginBottom: 16
          }}>
            {settingItems.map((item) => (
              <div key={item.key} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.6)',
                boxShadow: '0 1px 1px rgba(0, 0, 0, 0.03)'
              }}>
                <Typography.Text>{item.label}</Typography.Text>
                <Switch
                  checked={config[item.key] as boolean}
                  onChange={v => updateConfig(item.key, v)}
                />
              </div>
            ))}
          </div>
          
          <Divider style={{ 
            margin: '16px 0',
            borderColor: 'rgba(0, 0, 0, 0.06)'
          }} />
          
          <Typography.Text 
            type="secondary" 
            style={{ 
              display: 'block', 
              marginBottom: 16,
              fontSize: 13
            }}
          >
            所有状态仅为模拟，实际应由后端API驱动
          </Typography.Text>
          
          {config.phase === 1 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(255, 241, 242, 0.6)',
              border: '1px solid rgba(254, 202, 202, 0.3)'
            }}>
              <Button
                type="primary"
                danger
                disabled={!canLottery}
                onClick={handleLottery}
                style={{ minWidth: 160 }}
              >
                进行抽签并进入阶段2
              </Button>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                仅当所有开关都关闭时可抽签
              </Typography.Text>
            </div>
          )}
          
          {config.phase === 2 && (
            <Typography.Text 
              type="warning"
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: 6,
                background: 'rgba(253, 230, 138, 0.3)',
                fontSize: 13
              }}
            >
              阶段2不可逆回阶段1
            </Typography.Text>
          )}
        </Card>
      </BackgroundLayout>
    </DefaultLayout>
  );
};

export default SystemSettingsPage;