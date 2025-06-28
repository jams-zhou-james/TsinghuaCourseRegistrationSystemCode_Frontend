// Components/Sidebar.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { courseListPagePath } from 'Pages/CourseListPage';
import { courseSelectionPagePath } from 'Pages/CourseSelectionPage';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const DefaultSidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to={courseListPagePath}>我的课程</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />}>
          <Link to={courseSelectionPagePath}>选课</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default DefaultSidebar;