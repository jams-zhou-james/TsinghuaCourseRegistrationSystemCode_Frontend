// Components/Sidebars/StudentSidebar.tsx
import React from 'react';
import ConfigurableSidebar from './ConfigurableSidebar';
import { studentSidebarConfig } from './Configs/StudentConfig';

const StudentSidebar = ({ collapsed, onCollapse }) => {
  return (
    <ConfigurableSidebar 
      collapsed={collapsed}
      onCollapse={onCollapse}
      config={studentSidebarConfig}
    />
  );
};

export default StudentSidebar;
