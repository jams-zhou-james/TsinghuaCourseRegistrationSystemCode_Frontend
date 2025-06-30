// Components/Sidebars/Configs/StudentConfig.tsx
import { HomeOutlined, SolutionOutlined } from '@ant-design/icons';
import { studentCourseListPagePath } from 'Pages/Student/CourseListPage';
import { courseSelectionPagePath } from 'Pages/Student/CourseSelectionPage';
import { SidebarConfig } from 'Components/Sidebars/ConfigurableSidebar';
import React from 'react';

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
    menuItemColor: 'rgba(0, 0, 0, 0.85)',
    menuItemSelectedColor: '#fff',
    menuItemHoverColor: 'rgba(0, 0, 0, 0.85)',
    menuItemBg: 'transparent',
    menuItemSelectedBg: '#ff85c0',
    menuItemHoverBg: 'rgba(255, 214, 231, 0.6)'
  },
  title: {
    full: '学生系统',
    collapsed: '学'
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
    }
  ]
};

