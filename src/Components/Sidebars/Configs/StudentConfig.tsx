// Configs/StudentConfig.tsx
import { HomeOutlined, SolutionOutlined } from '@ant-design/icons';
import { studentCourseListPagePath } from 'Pages/Student/CourseListPage';
import { courseSelectionPagePath } from 'Pages/Student/CourseSelectionPage';
import React from 'react';

export const studentSidebarConfig = {
  theme: {
    siderBg: '#ffd6e7', // 原版粉色背景
    menuItemColor: 'rgba(0, 0, 0, 0.85)',
    menuItemSelectedColor: '#fff',
    menuItemHoverColor: 'rgba(0, 0, 0, 0.85)',
    menuItemBg: 'transparent',
    menuItemSelectedBg: '#ff85c0', // 原版选中粉色
    menuItemHoverBg: 'rgba(255, 133, 192, 0.3)', // 原版悬停半透明粉
  },
  title: {
    full: '学生系统',
    collapsed: '学',
  },
  menuItems: [
    {
      key: '1',
      icon: <HomeOutlined />, // 必须传入JSX元素
      label: '我的课程',
      path: studentCourseListPagePath,
    },
    {
      key: '2',
      icon: <SolutionOutlined />,
      label: '选课中心',
      path: courseSelectionPagePath,
    },
  ],
};