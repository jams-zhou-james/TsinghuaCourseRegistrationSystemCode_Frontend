// src/Components/Layouts/BackgroundLayout.tsx
import React from 'react';
import { Layout } from 'antd';
import { LayoutProps } from 'antd/lib/layout';

interface BackgroundLayoutProps extends LayoutProps {
  gradient?: string;
  blurCircles?: boolean;
  contentMaxWidth?: number | string;
  contentPadding?: number | string;
  contentStyle?: React.CSSProperties;
}

const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({
  gradient = 'linear-gradient(135deg, #ede9fe 0%, #c7d2fe 100%)',
  blurCircles = true,
  contentMaxWidth = 420,
  contentPadding = 24,
  contentStyle = {},
  children,
  ...layoutProps
}) => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: gradient,
        fontFamily: "'Poppins','Noto Sans SC',sans-serif",
        padding: 48,
        ...layoutProps.style,
      }}
      {...layoutProps}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: contentMaxWidth,
          padding: contentPadding,
          borderRadius: 32,
          boxShadow: '0 8px 32px 0 rgba(76, 29, 149, 0.18)',
          background: 'rgba(255,255,255,0.95)',
          border: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...contentStyle,
        }}
      >
        {blurCircles && (
          <>
            <div
              style={{
                position: 'absolute',
                top: -64,
                left: -64,
                width: 192,
                height: 192,
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                borderRadius: '50%',
                filter: 'blur(48px)',
                opacity: 0.25,
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -64,
                right: -64,
                width: 192,
                height: 192,
                background: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)',
                borderRadius: '50%',
                filter: 'blur(48px)',
                opacity: 0.18,
                zIndex: 0,
              }}
            />
          </>
        )}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default BackgroundLayout;