// components/sidebars/TeacherSidebar.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';

const { Sider } = Layout;

interface TeacherSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ collapsed, onCollapse }) => {
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to="/my-courses">我的课程</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<BookOutlined />}>
          <Link to="/course-management">课程管理</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<UserOutlined />}>
          <Link to="/student-management">学生管理</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<BookOutlined />}>
          <Link to="/grade-management">成绩录入</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default TeacherSidebar;