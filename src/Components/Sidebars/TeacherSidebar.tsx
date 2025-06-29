// components/sidebars/TeacherSidebar.tsx
import React from 'react';
import { ConfigProvider, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { teacherCourseListPagePath } from 'Pages/Teacher/CourseListPage';
import { purpleTheme } from '../../Components/Themes/Themes';

const { Sider } = Layout;

interface TeacherSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ collapsed, onCollapse }) => {
  return (
  <ConfigProvider theme={purpleTheme}>
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to={teacherCourseListPagePath}>我的课程</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  </ConfigProvider>
  );
};

export default TeacherSidebar;