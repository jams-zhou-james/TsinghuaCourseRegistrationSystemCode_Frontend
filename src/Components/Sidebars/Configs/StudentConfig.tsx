// Components/Sidebars/Configs/StudentConfig.tsx
import { HomeOutlined, SolutionOutlined, CalendarOutlined, StarOutlined } from '@ant-design/icons';
import { courseSelectionPagePath } from 'Pages/Student/CourseSelectionPage';
import { courseEvaluationPagePath } from 'Pages/Student/CourseEvaluationPage';
import { courseTablePagePath } from 'Pages/CourseTablePage';
import { SidebarConfig } from 'Components/Sidebars/ConfigurableSidebar';
import React from 'react';
import { logoutPagePath } from 'Pages/LogoutPage';

export const studentSidebarConfig: SidebarConfig = {
  theme: {
    gradient: {
      direction: 'to bottom left',
      colors: {
        start: 'rgb(254, 245, 249)', // 半透明粉色
        middle: 'rgb(252, 230, 239)', // 半透明浅粉色
        end: 'rgb(250, 216, 232)' // 半透明粉色
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
      icon: <SolutionOutlined />,
      label: '选课中心',
      path: courseSelectionPagePath
    },
    {
      key: '2',
      icon: <CalendarOutlined />,
      label: '课程表',
      path: courseTablePagePath
    },
    {
      key: '3',
      icon: <StarOutlined />,
      label: '课程评价',
      path: courseEvaluationPagePath
    },
        {
          key: '5',
          icon: <SolutionOutlined />,
          label: '登出',
          path: logoutPagePath
        }
  ]
};

