// Components/Sidebars/TeacherSidebar.tsx
import React from 'react';
import { ConfigurableSidebar, SidebarProps,  } from './ConfigurableSidebar';
import { teacherSidebarConfig } from './Configs/TeacherConfig';


const TeacherSidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onCollapse 
}) => {
  return (
    <ConfigurableSidebar 
      collapsed={collapsed}
      onCollapse={onCollapse}
      config={teacherSidebarConfig}
    />
  );
};

export default TeacherSidebar;

