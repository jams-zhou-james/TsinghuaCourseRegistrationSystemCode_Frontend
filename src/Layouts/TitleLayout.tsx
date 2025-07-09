// src/Components/Layouts/TitleLayout.tsx
import React from 'react';
import { Layout } from 'antd';
import { LayoutProps } from 'antd/lib/layout';

export interface TitleLayoutProps extends LayoutProps {
  titleColor?: string,
  title: string
}

const TitleLayout: React.FC<TitleLayoutProps> = ({
  titleColor = '#1e40af',
  title,
  children,
  ...layoutProps
}) => {
  return (
    <Layout 
  style={{ 
    minHeight: '80vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent'
  }}
  {...layoutProps}
>
    <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 24, color: '#1e40af', marginBottom: 16 }}>{title}</h2>
          {children}
    </div>
    </Layout>
  )
};

export default TitleLayout;

