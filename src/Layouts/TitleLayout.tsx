// src/Components/Layouts/TitleLayout.tsx
import React from 'react';
import { Layout } from 'antd';
import { LayoutProps } from 'antd/lib/layout';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';

export interface TitleLayoutProps extends LayoutProps {
  titleColor?: string;
  title: string;
  titleStyle?: React.CSSProperties;
}

const studentTitleLayoutProps: Partial<TitleLayoutProps> = {
  titleColor: '#be185d' // A pinkish color for students
};

const teacherTitleLayoutProps: Partial<TitleLayoutProps> = {
  titleColor: '#5b21b6' // A purple color for teachers
};

const adminTitleLayoutProps: Partial<TitleLayoutProps> = {
  titleColor: '#0369a1' // A blue color for admins
};

const defaultTitleLayoutProps: Partial<TitleLayoutProps> = {
  titleColor: '#1e40af' // Default blue color
};

const getTitlePropsByRole = (role: UserRole): Partial<TitleLayoutProps> => {
  switch (role) {
    case UserRole.student:
      return studentTitleLayoutProps;
    case UserRole.teacher:
      return teacherTitleLayoutProps;
    case UserRole.superAdmin:
      return adminTitleLayoutProps;
    default:
      return defaultTitleLayoutProps;
  }
};

const TitleLayout: React.FC<TitleLayoutProps> = ({
  titleColor = '#1e40af',
  title,
  titleStyle = {},
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
        background: 'transparent',
        ...layoutProps.style,
      }}
      {...layoutProps}
    >
      <div style={{ width: '100%' }}>
        <h2 style={{ 
          fontSize: 24, 
          color: titleColor, 
          marginBottom: 16,
          fontWeight: 600,
          ...titleStyle 
        }}>
          {title}
        </h2>
        {children}
      </div>
    </Layout>
  );
};

interface WithRoleBasedTitleLayoutProps extends Omit<TitleLayoutProps, 'titleColor'> {
  role: UserRole;
}

export const WithRoleBasedTitleLayout: React.FC<WithRoleBasedTitleLayoutProps> = ({ 
  role,
  title,
  titleStyle,
  children,
  ...layoutProps
}) => {
  const roleBasedProps = getTitlePropsByRole(role);
  
  return (
    <TitleLayout
      title={title}
      titleColor={roleBasedProps.titleColor}
      titleStyle={titleStyle}
      {...layoutProps}
    >
      {children}
    </TitleLayout>
  );
};

export default TitleLayout;