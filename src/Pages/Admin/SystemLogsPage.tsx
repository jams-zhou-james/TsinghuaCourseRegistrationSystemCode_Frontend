export const systemLogsPagePath = "/admin/log"

import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Typography, DatePicker, Input, message, Spin, Space } from 'antd';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout, { WithRoleBasedBackgroundLayout } from '../../Layouts/BackgroundLayout';
import { UserRole } from '../../Plugins/UserAccountService/Objects/UserRole';
import { useUserToken } from 'Globals/GlobalStore';
import { QuerySystemLogsMessage } from 'Plugins/SystemLogService/APIs/QuerySystemLogsMessage';
import { SystemLogEntry } from 'Plugins/SystemLogService/Objects/SystemLogEntry';
import dayjs from 'dayjs';
import WithRoleBasedTopbarLayout from '../../Layouts/WithRoleBasedTopbarLayout';
import TitleLayout, { WithRoleBasedTitleLayout } from '../../Layouts/TitleLayout';
import WithRoleBasedSidebarLayout from '../../Layouts/WithRoleBasedSidebarLayout';

const { RangePicker } = DatePicker;

const SystemLogsPage: React.FC = () => {
  const userToken = useUserToken();
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [userIDs, setUserIDs] = useState<string>('');

  // 查询日志
  const fetchLogs = () => {
    setLoading(true);
    const fromTimestamp = dateRange[0] ? dateRange[0].valueOf() : null;
    const toTimestamp = dateRange[1] ? dateRange[1].valueOf() : null;
    let userIDArr: number[] = [];
    if (userIDs.trim()) {
      userIDArr = userIDs.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    }
    new QuerySystemLogsMessage(userToken, fromTimestamp, toTimestamp, userIDArr).send(
      (info: string) => {
        try {
          const arr = JSON.parse(info);
          setLogs(Array.isArray(arr) ? arr.map((item: any) => new SystemLogEntry(
            item.logID, item.timestamp, item.userID, item.action, item.details
          )) : []);
        } catch (e) {
          message.error('解析日志数据失败');
        } finally {
          setLoading(false);
        }
      },
      (err: string) => {
        message.error('获取日志失败');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const columns = [
    { 
      title: '日志ID', 
      dataIndex: 'logID', 
      key: 'logID', 
      width: 100,
      fixed: 'left' as const
    },
    { 
      title: '时间', 
      dataIndex: 'timestamp', 
      key: 'timestamp', 
      width: 180, 
      render: (ts: number) => ts ? new Date(ts).toLocaleString() : '' 
    },
    { 
      title: '用户ID', 
      dataIndex: 'userID', 
      key: 'userID', 
      width: 120 
    },
    { 
      title: '操作', 
      dataIndex: 'action', 
      key: 'action', 
      width: 200 
    },
    { 
      title: '详情', 
      dataIndex: 'details', 
      key: 'details', 
      render: (text: string) => (
        <Typography.Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {text}
        </Typography.Text>
      )
    },
  ];

  return (
    <DefaultLayout role={UserRole.superAdmin}>
      <WithRoleBasedTopbarLayout userToken={userToken} role={UserRole.superAdmin}>
      <WithRoleBasedBackgroundLayout role={UserRole.superAdmin}>
        <WithRoleBasedTitleLayout title="系统日志" role={UserRole.superAdmin}>
          <Card
            style={{ 
              margin: '0 auto', 
              borderRadius: 8, 
              minHeight: 600, 
              width: '100%',
              background: '#fff'
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* 筛选表单 */}
              <Space wrap align="center" style={{ marginBottom: 12 }}>
                <span>时间范围：</span>
                <RangePicker
                  showTime
                  value={dateRange}
                  onChange={setDateRange}
                  style={{ minWidth: 260 }}
                />
                <span>用户ID(可用逗号分隔)：</span>
                <Input
                  value={userIDs}
                  onChange={e => setUserIDs(e.target.value)}
                  placeholder="如 1,2,3"
                  style={{ width: 180 }}
                />
                <Button type="primary" onClick={fetchLogs} loading={loading}>查询</Button>
              </Space>
              {/* 日志表格 */}
              <Spin spinning={loading} tip="加载中...">
                <Table
                  columns={columns}
                  dataSource={logs}
                  rowKey="logID"
                  pagination={{ pageSize: 20 }}
                  bordered
                  size="middle"
                  scroll={{ x: '100%' }}
                  style={{ 
                    background: '#fff', 
                    borderRadius: 8,
                    width: '100%'
                  }}
                />
              </Spin>
            </Space>
          </Card>
        </WithRoleBasedTitleLayout>
        </WithRoleBasedBackgroundLayout>
      </WithRoleBasedTopbarLayout>
    </DefaultLayout>
  );
};

export default SystemLogsPage;