// Components/Sidebars/Configs/AdminConfig.tsx
import { HomeOutlined, SolutionOutlined } from '@ant-design/icons';
import { SidebarConfig } from 'Components/Sidebars/ConfigurableSidebar';
import React from 'react';
import { systemSettingsPagePath } from 'Pages/Admin/SystemSettingsPage';
import { userManagementPagePath } from 'Pages/Admin/UserManagementPage';

export const adminSidebarConfig: SidebarConfig = {
  theme: {
    gradient: {
      direction: 'to bottom right',
      colors: {
        start: 'rgb(222, 235, 255)', // 淡冰蓝色
        middle: 'rgb(213, 230, 253)', // 中等淡蓝色
        end: 'rgb(201, 221, 254)' // 稍深的淡蓝色
      }
    },
    siderBg: '#64b5f6', // 标准淡蓝色
    menuItemColor: 'rgba(13, 71, 161, 0.85)', // 深蓝色
    menuItemSelectedColor: '#fff',
    menuItemHoverColor: 'rgb(255, 255, 255)',
    menuItemBg: 'transparent',
    menuItemSelectedBg: '#42a5f5', // 鲜艳淡蓝色
    menuItemHoverBg: 'rgba(2, 136, 209, 0.87)' // 深蓝色带透明度
  },
  title: {
    full: 'THU选课系统',
    collapsed: 'THU'
  },
  menuItems: [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: '用户管理',
      path: userManagementPagePath
    },
    {
      key: '2',
      icon: <SolutionOutlined />,
      label: '系统设置',
      path: systemSettingsPagePath
    },
    {
      key: '3',
      icon: <SolutionOutlined />,
      label: '审计日志',
      path: '/admin/audit-logs'
    }
  ]
};

