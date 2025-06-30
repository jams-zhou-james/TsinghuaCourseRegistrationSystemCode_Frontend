// Components/Sidebars/StudentSidebar.tsx
import React from 'react';
import { ConfigurableSidebar, SidebarProps,  } from './ConfigurableSidebar';
import { studentSidebarConfig } from './Configs/StudentConfig';


const StudentSidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onCollapse 
}) => {
  return (
    <ConfigurableSidebar 
      collapsed={collapsed}
      onCollapse={onCollapse}
      config={studentSidebarConfig}
    />
  );
};

export default StudentSidebar;

