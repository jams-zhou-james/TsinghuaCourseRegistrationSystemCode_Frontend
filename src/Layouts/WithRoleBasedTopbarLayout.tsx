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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DynamicTopbar
        userToken={userToken}
        role={role}
      />
      <Layout>
        <Content style={{ margin: '0px 0px', padding: 0 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default WithRoleBasedTopbarLayout;

