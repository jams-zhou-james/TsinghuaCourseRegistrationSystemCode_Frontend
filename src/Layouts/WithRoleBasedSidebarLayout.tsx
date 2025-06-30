// layouts/WithRoleBasedSidebarLayout.tsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import { UserRole } from 'Plugins/UserService/Objects/UserRole';
import DynamicSidebar from '../Components/Sidebars/DynamicSidebar';

const { Content } = Layout;

interface WithRoleBasedSidebarLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const WithRoleBasedSidebarLayout: React.FC<WithRoleBasedSidebarLayoutProps> = ({ 
  children, 
  role 
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DynamicSidebar 
        role={role} 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
      />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default WithRoleBasedSidebarLayout;