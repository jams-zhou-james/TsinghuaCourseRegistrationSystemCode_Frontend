// layouts/WithSidebarLayout.tsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import DefaultSidebar from '../Components/Sidebar';

const { Content } = Layout;

interface WithSidebarLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<WithSidebarLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DefaultSidebar 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)} 
      />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;