// components/sidebars/TeacherSidebar.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { teacherCourseListPagePath } from 'Pages/Teacher/CourseListPage';

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
          <Link to={teacherCourseListPagePath}>我的课程</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default TeacherSidebar;