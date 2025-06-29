import { ConfigProvider, Layout, Menu } from 'antd';
import { HomeOutlined, SolutionOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './StudentSidebar.css'; // 创建这个CSS文件
import { studentCourseListPagePath } from 'Pages/Student/CourseListPage';
import { courseSelectionPagePath } from 'Pages/Student/CourseSelectionPage';
import React from 'react';

const { Sider } = Layout;


interface StudentSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ collapsed, onCollapse }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemMarginInline: 0,      // 移除水平边距
            itemPaddingInline: 16,    // 设置内边距
            itemBorderRadius: 8,      // 圆角
            activeBarBorderWidth: 0,   // 完全移除选中条
            itemColor: 'rgba(0, 0, 0, 0.85)',
            itemSelectedColor: '#fff',
            itemHoverColor: 'rgba(0, 0, 0, 0.85)',
            itemBg: 'transparent',
            itemSelectedBg: '#ff85c0',
            itemHoverBg: 'rgba(255, 133, 192, 0.3)',
            activeBarWidth: 0,
          },
          Layout: {
            siderBg: '#ffd6e7',
          },
        },
      }}
    >
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={onCollapse}
        className="custom-sider"
      >
        <div className="logo-container">
          {!collapsed && <span className="logo-text">学生系统</span>}
          {collapsed && <span className="logo-text">学</span>}
        </div>
        
        <Menu 
          theme="light"
          defaultSelectedKeys={['1']} 
          mode="inline"
          className="custom-menu"
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to={studentCourseListPagePath}>我的课程</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<SolutionOutlined />}>
            <Link to={courseSelectionPagePath}>选课中心</Link>
          </Menu.Item>
        </Menu>
        
        <div className="sidebar-footer" />
      </Sider>
    </ConfigProvider>
  );
};

export default StudentSidebar;