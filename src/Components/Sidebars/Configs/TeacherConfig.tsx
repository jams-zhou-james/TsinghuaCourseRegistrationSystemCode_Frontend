// Components/Sidebars/Configs/StudentConfig.tsx
import { HomeOutlined, SolutionOutlined } from '@ant-design/icons';
import { SidebarConfig } from 'Components/Sidebars/ConfigurableSidebar';
import React from 'react';
import { teacherCourseListPagePath } from 'Pages/Teacher/CourseListPage';
import { logoutPagePath } from 'Pages/LogoutPage';

export const teacherSidebarConfig: SidebarConfig = {
  theme: {
    gradient: {
      direction: 'to bottom right',
      colors: {
        start: 'rgb(232, 222, 255)', // 淡紫色
        middle: 'rgb(224, 213, 253)', // 中等淡紫色
        end: 'rgb(216, 201, 254)' // 稍深的淡紫色
      }
    },
    siderBg: '#b388ff', // 中等紫色
    menuItemColor: 'rgba(81, 45, 168, 0.85)', // 深紫色
    menuItemSelectedColor: '#fff',
    menuItemHoverColor: 'rgb(255, 255, 255)',
    menuItemBg: 'transparent',
    menuItemSelectedBg: '#7c4dff', // 鲜艳紫色
    menuItemHoverBg: 'rgba(98, 0, 234, 0.87)' // 深紫色带透明度
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
      path: teacherCourseListPagePath
    },
        {
          key: '2',
          icon: <SolutionOutlined />,
          label: '登出',
          path: logoutPagePath
        }
  ]
};