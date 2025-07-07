// Components/Topbars/DynamicTopbar.tsx

import React from 'react';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { ConfigurableTopbar } from './ConfigurableTopbar';
import { StudentTopbarThemeConfig } from './Configs/StudentConfig';
import { AdminTopbarThemeConfig } from './Configs/AdminConfig';
import { TeacherTopbarThemeConfig } from './Configs/TeacherConfig';

interface DynamicTopbarProps {
  userToken: string
  role: UserRole;
}

const DynamicSidebar: React.FC<DynamicTopbarProps> = ({ userToken, role }) => {
  switch (role) {
    case UserRole.superAdmin:
      return <ConfigurableTopbar theme={AdminTopbarThemeConfig} userToken={userToken} />;
    case UserRole.teacher:
      return <ConfigurableTopbar theme={TeacherTopbarThemeConfig} userToken={userToken} />;
    case UserRole.student:
    default:
      return <ConfigurableTopbar theme={StudentTopbarThemeConfig} userToken={userToken} />;
  }
};

export default DynamicSidebar;

