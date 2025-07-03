// src/Pages/Admin/SystemSettingsPage.tsx

export const systemSettingsPagePath = "/admin/system-settings"

import React, { useState, useEffect } from 'react';
import { Card, Switch, Button, Typography, Divider, message, Skeleton } from 'antd';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout from '../../Layouts/BackgroundLayout';
import { UserRole } from '../../Plugins/UserAccountService/Objects/UserRole';
import { useUserToken } from 'Globals/GlobalStore';
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { RunCourseRandomSelectionAndMoveToNextPhaseMessage } from 'Plugins/SemesterPhaseService/APIs/RunCourseRandomSelectionAndMoveToNextPhaseMessage';
import { UpdateSemesterPhasePermissionsMessage } from 'Plugins/SemesterPhaseService/APIs/UpdateSemesterPhasePermissionsMessage';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';
import { Permissions } from 'Plugins/SemesterPhaseService/Objects/Permissions'
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';

interface SystemConfig {
  phase: Phase;
  allowTeacherEditCourse: boolean;
  allowStudentSelectCourse: boolean;
  allowStudentDropCourse: boolean;
  allowStudentEvaluate: boolean;
  lotteryDone: boolean;
}

const initialConfig: SystemConfig = {
  phase: Phase.phase1,
  allowTeacherEditCourse: false,
  allowStudentSelectCourse: false,
  allowStudentDropCourse: false,
  allowStudentEvaluate: false,
  lotteryDone: false,
};

interface SettingItem {
  label: string;
  key: keyof Omit<SystemConfig, 'phase' | 'lotteryDone'>;
}

const SystemSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(initialConfig);
  const [loading, setLoading] = useState(false);
  const userToken = useUserToken();

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = () => {
  setLoading(true);
  new QuerySemesterPhaseStatusMessage(userToken).send(
    (info: string) => {
      try {
        // Parse the JSON string to get the raw data
        const rawData = JSON.parse(info);

        // Create a new SemesterPhase instance from the raw data
        const semesterPhase = new SemesterPhase(
          Phase[rawData.currentPhase as keyof typeof Phase],
          new Permissions(
            rawData.permissions.allowTeacherManage,
            rawData.permissions.allowStudentSelect,
            rawData.permissions.allowStudentDrop,
            rawData.permissions.allowStudentEvaluate
          )
        );

        setConfig({
          phase: semesterPhase.currentPhase,
          allowTeacherEditCourse: semesterPhase.permissions.allowTeacherManage,
          allowStudentSelectCourse: semesterPhase.permissions.allowStudentSelect,
          allowStudentDropCourse: semesterPhase.permissions.allowStudentDrop,
          allowStudentEvaluate: semesterPhase.permissions.allowStudentEvaluate,
          lotteryDone: semesterPhase.currentPhase === Phase.phase2,
        });
      } catch (error) {
        message.error('解析系统状态数据失败');
        console.error('Error parsing system status:', error);
      } finally {
        setLoading(false);
      }
    },
    (error: string) => {
      message.error('获取系统状态失败');
      console.error('Error fetching system status:', error);
      setLoading(false);
    }
  );
};


  const updateConfig = (key: keyof Omit<SystemConfig, 'phase' | 'lotteryDone'>, value: boolean) => {
    setLoading(true);
    const updatedConfig = { ...config, [key]: value };
    
    new UpdateSemesterPhasePermissionsMessage(
      userToken,
      updatedConfig.allowTeacherEditCourse,
      updatedConfig.allowStudentSelectCourse,
      updatedConfig.allowStudentDropCourse,
      updatedConfig.allowStudentEvaluate
    ).send(
      (info: string) => {
  try {
    const rawData = JSON.parse(info);
    const permissions = new Permissions(
      rawData.allowTeacherManage,
      rawData.allowStudentSelect,
      rawData.allowStudentDrop,
      rawData.allowStudentEvaluate
    );
    
    setConfig(prev => ({ ...prev, [key]: value }));
    message.success('设置已更新');
  } catch (error) {
    message.error('解析权限数据失败');
    console.error('Error parsing permissions:', error);
  } finally {
    setLoading(false);
  }
}, (error: string) => {
      message.error('更新系统状态失败');
      console.error('Error fetching system status:', error);
      setLoading(false);
    }
    );
  };

  const handleLottery = () => {
    setLoading(true);
    new RunCourseRandomSelectionAndMoveToNextPhaseMessage(userToken).send(
      (info: string) => {
        try {
          const result = JSON.parse(info);
          if (!result || typeof result !== 'string') {
            throw new Error('Invalid lottery result');
          }

          setConfig(prev => ({
            ...prev,
            phase: Phase.phase2,
            lotteryDone: true,
            allowTeacherEditCourse: false,
            allowStudentSelectCourse: false,
            allowStudentDropCourse: false,
            allowStudentEvaluate: false,
          }));
          message.success(result);
        } catch (error) {
          message.error('解析抽签结果失败');
          console.error('Error parsing lottery result:', error);
        } finally {
          setLoading(false);
        }
      },
      (error: string) => {
        message.error('抽签操作失败');
        console.error('Error running lottery:', error);
        setLoading(false);
      }
    );
  };

  const canLottery =
    config.phase === Phase.phase1 &&
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
      <BackgroundLayout>
        <Card
  title="系统设置"
  loading={loading}
  style={{
    maxWidth: 800,
    width: '100%',
    margin: '0 auto',
    borderRadius: 8,
    minHeight: 500,
    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
  }}
>
  {/* 阶段显示 - 固定高度 */}
  <div style={{ minHeight: 40, marginBottom: 16 }}>
    <Typography.Text strong style={{ display: 'block' }}>
      当前阶段：{loading ? '加载中...' : config.phase === Phase.phase1 ? '阶段 1' : '阶段 2'}
    </Typography.Text>
  </div>

  {/* 开关组 - 固定高度容器 */}
  <div style={{ 
    minHeight: 200, // 根据项目数量调整
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16
  }}>
    {loading ? (
      <Skeleton active paragraph={{ rows: 4 }} /> // 加载态骨架屏
    ) : (
      settingItems.map((item) => (
        <div key={item.key} style={{ 
          minHeight: 48, // 每个选项最小高度
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
            disabled={loading || (config.phase === Phase.phase2 && item.key !== 'allowStudentEvaluate')}
          />
        </div>
      ))
    )}
  </div>

  {/* 分隔线 - 固定位置 */}
  <Divider style={{ margin: '16px 0' }} />

  {/* 底部操作区 - 固定高度 */}
  <div style={{ minHeight: 80 }}>
    {loading ? (
      <Skeleton.Button active style={{ width: 160, height: 32 }} />
    ) : config.phase === Phase.phase1 ? (
      <div style={{ /* 原有样式 */ }}>
        <Button
          type="primary"
          danger
          disabled={!canLottery || loading}
          onClick={handleLottery}
          loading={loading}
          style={{ minWidth: 160 }}
        >
          进行抽签并进入阶段2
        </Button>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          仅当所有开关都关闭时可抽签
        </Typography.Text>
      </div>
    ) : (
      <Typography.Text type="warning" style={{ /* 原有样式 */ }}>
        阶段2不可逆回阶段1
      </Typography.Text>
    )}
  </div>
</Card>
      </BackgroundLayout>
    </DefaultLayout>
  );
};

export default SystemSettingsPage;