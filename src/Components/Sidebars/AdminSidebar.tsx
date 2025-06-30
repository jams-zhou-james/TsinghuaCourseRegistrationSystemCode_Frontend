// Components/Sidebars/AdminSidebar.tsx
import React from 'react';
import { ConfigurableSidebar, SidebarProps,  } from './ConfigurableSidebar';
import { adminSidebarConfig } from './Configs/AdminConfig';


const AdminSidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onCollapse 
}) => {
  return (
    <ConfigurableSidebar 
      collapsed={collapsed}
      onCollapse={onCollapse}
      config={adminSidebarConfig}
    />
  );
};

export default AdminSidebar;

