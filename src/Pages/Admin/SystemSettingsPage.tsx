import React, { useState } from 'react';
import { Card, Switch, Button, Typography, Divider, message } from 'antd';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import { UserRole } from '../../Plugins/UserService/Objects/UserRole';

export const systemSettingsPagePath = '/admin/system-settings';
// 模拟初始状态
const initialConfig = {
  phase: 1, // 1: 阶段1, 2: 阶段2
  allowTeacherEditCourse: false,
  allowStudentSelectCourse: false,
  allowStudentDropCourse: false,
  allowStudentEvaluate: false,
  lotteryDone: false,
};

const SystemSettingsPage: React.FC = () => {
  const [config, setConfig] = useState(initialConfig);
  // 模拟API
  const updateConfig = (key: keyof typeof initialConfig, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    message.success('设置已更新（模拟）');
  };

  // 抽签逻辑
  const handleLottery = () => {
    setConfig(prev => ({ ...prev, phase: 2, lotteryDone: true }));
    message.success('抽签完成，已进入阶段2（模拟）');
  };

  // 阶段1且所有开关都关闭时才可抽签
  const canLottery =
    config.phase === 1 &&
    !config.allowTeacherEditCourse &&
    !config.allowStudentSelectCourse &&
    !config.allowStudentDropCourse &&
    !config.allowStudentEvaluate &&
    !config.lotteryDone;

  const renderContent = () => { return (
    <Card title="系统设置" style={{ maxWidth: 600, margin: '32px auto' }}>
      <Typography.Title level={4}>
        当前阶段：{config.phase === 1 ? '阶段 1' : '阶段 2'}
      </Typography.Title>
      <Divider />
      <div style={{ marginBottom: 16 }}>
        <span>允许老师创建/删除课程（组）：</span>
        <Switch
          checked={config.allowTeacherEditCourse}
          onChange={v => updateConfig('allowTeacherEditCourse', v)}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <span>允许学生选择课程：</span>
        <Switch
          checked={config.allowStudentSelectCourse}
          onChange={v => updateConfig('allowStudentSelectCourse', v)}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <span>允许学生退选课程：</span>
        <Switch
          checked={config.allowStudentDropCourse}
          onChange={v => updateConfig('allowStudentDropCourse', v)}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <span>允许学生对课程评价：</span>
        <Switch
          checked={config.allowStudentEvaluate}
          onChange={v => updateConfig('allowStudentEvaluate', v)}
        />
      </div>
      <Divider />
      <div style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary">所有状态仅为模拟，实际应由后端API驱动</Typography.Text>
      </div>
      {config.phase === 1 && (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            danger
            disabled={!canLottery}
            onClick={handleLottery}
          >
            进行抽签并进入阶段2
          </Button>
          <span style={{ marginLeft: 12, color: '#888' }}>
            仅当所有开关都关闭时可抽签
          </span>
        </div>
      )}
      {config.phase === 2 && (
        <Typography.Text type="warning">阶段2不可逆回阶段1</Typography.Text>
      )}
    </Card>
  )};

  return (
    <DefaultLayout role={UserRole.superAdmin}>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
        {renderContent()}
      </div>
    </DefaultLayout>
  );
};

export default SystemSettingsPage;