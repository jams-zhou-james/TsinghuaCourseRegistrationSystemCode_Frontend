// components/sidebars/StudentSidebar.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, SolutionOutlined } from '@ant-design/icons';

const { Sider } = Layout;

interface StudentSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ collapsed, onCollapse }) => {
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/my-courses">我的课程</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<SolutionOutlined />}>
          <Link to="/course-selection">选课中心</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default StudentSidebar;