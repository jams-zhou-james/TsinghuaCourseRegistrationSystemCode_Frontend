// components/sidebars/StudentSidebar.tsx
import React from 'react';
import { ConfigProvider, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, SolutionOutlined } from '@ant-design/icons';
import { studentCourseListPagePath } from 'Pages/Student/CourseListPage';
import { courseSelectionPagePath } from 'Pages/Student/CourseSelectionPage';
import { pinkTheme } from '../../Components/Themes/Themes';
const { Sider } = Layout;

interface StudentSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ collapsed, onCollapse }) => {
  return (
  <ConfigProvider theme={pinkTheme}>
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<HomeOutlined />}>
          <Link to={studentCourseListPagePath}>我的课程</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<SolutionOutlined />}>
          <Link to={courseSelectionPagePath}>选课中心</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  </ConfigProvider>
  );
};

export default StudentSidebar;