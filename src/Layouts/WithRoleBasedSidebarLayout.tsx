// layouts/WithRoleBasedSidebarLayout.tsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
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

  // Sidebar width, adjust if your DynamicSidebar width is different
  const sidebarWidth = collapsed ? 80 : 200;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Fixed Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 3000, // 提高z-index，确保Sidebar在页面最上方
          width: sidebarWidth,
          transition: 'width 0.2s',
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
        }}
      >
        <DynamicSidebar
          role={role}
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />
      </div>
      {/* Main Content with left margin */}
      <Layout style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.2s' }}>
        <Content style={{ margin: '0px 0px', padding: 0 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default WithRoleBasedSidebarLayout;

