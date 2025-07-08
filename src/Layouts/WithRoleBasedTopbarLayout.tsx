// layouts/WithRoleBasedSidebarLayout.tsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import DynamicTopbar from '../Components/Topbars/DynamicTopbar';

const { Content } = Layout;

interface WithRoleBasedTopbarLayoutProps {
  children: React.ReactNode;
  userToken: string
  role: UserRole;
}

const WithRoleBasedTopbarLayout: React.FC<WithRoleBasedTopbarLayoutProps> = ({ 
  children,
  userToken,
  role 
}) => {

  // 顶栏高度（与ConfigurableTopbar一致）
  const topbarHeight = 56;
  return (
    <>
      {/* Topbar，zIndex低于Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: topbarHeight,
          zIndex: 2000, // 低于Sidebar
          background: 'white',
        }}
      >
        <DynamicTopbar userToken={userToken} role={role} />
      </div>
      <div style={{ marginTop: topbarHeight }}>
        {children}
      </div>
    </>
  );
};

export default WithRoleBasedTopbarLayout;

