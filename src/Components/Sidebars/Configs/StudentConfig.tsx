// Components/Sidebars/Configs/StudentConfig.tsx
import { HomeOutlined, SolutionOutlined, CalendarOutlined } from '@ant-design/icons';
import { studentCourseListPagePath } from 'Pages/Student/CourseListPage';
import { courseSelectionPagePath } from 'Pages/Student/CourseSelectionPage';
import { courseTablePagePath } from 'Pages/CourseTablePage';
import { SidebarConfig } from 'Components/Sidebars/ConfigurableSidebar';
import React from 'react';
import { logoutPagePath } from 'Pages/LogoutPage';

export const studentSidebarConfig: SidebarConfig = {
  theme: {
    gradient: {
      direction: 'to bottom right',
      colors: {
        start: 'rgb(255, 222, 237)', // 半透明粉色
        middle: 'rgb(253, 213, 230)', // 半透明浅粉色
        end: 'rgb(254, 201, 226)' // 半透明粉色
      }
    },
    siderBg: '#ffb6d8',
    menuItemColor: 'rgba(198, 26, 26, 0.85)',
    menuItemSelectedColor: '#fff',
    menuItemHoverColor: 'rgb(255, 255, 255)',
    menuItemBg: 'transparent',
    menuItemSelectedBg: '#ff85c0',
    menuItemHoverBg: 'rgba(232, 64, 134, 0.87)'
  },
  title: {
    full: 'THU选课系统',
    collapsed: 'THU'
  },
  menuItems: [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: '我的课程',
      path: studentCourseListPagePath
    },
    {
      key: '2',
      icon: <SolutionOutlined />,
      label: '选课中心',
      path: courseSelectionPagePath
    },
    {
      key: '3',
      icon: <CalendarOutlined />,
      label: '课程表',
      path: courseTablePagePath
    },
        {
          key: '4',
          icon: <SolutionOutlined />,
          label: '登出',
          path: logoutPagePath
        }
  ]
};

