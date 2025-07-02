// components/DynamicSidebar.tsx
import React from 'react';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import StudentSidebar from './StudentSidebar';
import TeacherSidebar from './TeacherSidebar';
import AdminSidebar from './AdminSidebar';

interface DynamicSidebarProps {
  role: UserRole;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({ role, collapsed, onCollapse }) => {
  switch (role) {
    case UserRole.superAdmin:
      return <AdminSidebar collapsed={collapsed} onCollapse={onCollapse} />;
    case UserRole.teacher:
      return <TeacherSidebar collapsed={collapsed} onCollapse={onCollapse} />;
    case UserRole.student:
    default:
      return <StudentSidebar collapsed={collapsed} onCollapse={onCollapse} />;
  }
};

export default DynamicSidebar;