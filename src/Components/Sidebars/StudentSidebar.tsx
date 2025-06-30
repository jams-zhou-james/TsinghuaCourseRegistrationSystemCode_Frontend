// Components/Sidebars/StudentSidebar.tsx
import React from 'react';
import ConfigurableSidebar from './ConfigurableSidebar';
import { studentSidebarConfig } from './Configs/StudentConfig';

interface StudentSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
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

