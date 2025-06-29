// components/sidebars/AdminSidebar.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { userManagementPagePath } from 'Pages/Admin/UserManagementPage';
import { systemSettingsPagePath } from 'Pages/Admin/SystemSettingsPage';

const { Sider } = Layout;

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onCollapse }) => {
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="2" icon={<UserOutlined />}>
          <Link to={userManagementPagePath}>用户管理</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<SettingOutlined />}>
          <Link to={systemSettingsPagePath}>系统设置</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<SettingOutlined />}>
          <Link to="/admin/audit-logs">审计日志</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AdminSidebar;