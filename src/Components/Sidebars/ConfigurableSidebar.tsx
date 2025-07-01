// Components/Sidebars/ConfigurableSidebar.tsx
import { ConfigProvider, Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import React, { useMemo } from 'react';
import './ConfigurableSidebar.css';

const { Sider } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface GradientConfig {
  direction: string;
  colors: {
    start: string;
    middle: string;
    end: string;
  };
}

export interface SidebarConfig {
  theme: {
    gradient: GradientConfig;
    siderBg: string;
    menuItemColor: string;
    menuItemSelectedColor: string;
    menuItemHoverColor: string;
    menuItemBg: string;
    menuItemSelectedBg: string;
    menuItemHoverBg: string;
  };
  title: {
    full: string;
    collapsed: string;
  };
  menuItems: MenuItem[];
}

interface ConfigurableSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  config: SidebarConfig;
}

export const ConfigurableSidebar: React.FC<ConfigurableSidebarProps> = ({ 
  collapsed, 
  onCollapse,
  config
}) => {
  const location = useLocation();
  
  // 根据当前路由找到对应的菜单项key
  const selectedKeys = useMemo(() => {
    const currentItem = config.menuItems.find(item => item.path === location.pathname);
    return currentItem ? [currentItem.key] : [];
  }, [location.pathname, config.menuItems]);
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemMarginInline: 0,
            itemPaddingInline: 16,
            itemBorderRadius: 8,
            activeBarBorderWidth: 0,
            itemColor: config.theme.menuItemColor,
            itemSelectedColor: config.theme.menuItemSelectedColor,
            itemHoverColor: config.theme.menuItemHoverColor,
            itemBg: config.theme.menuItemBg,
            itemSelectedBg: config.theme.menuItemSelectedBg,
            itemHoverBg: config.theme.menuItemHoverBg,
            activeBarWidth: 0,
          },
          Layout: {
            siderBg: config.theme.siderBg,
          },
        },
      }}
    >
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={onCollapse}
        className="custom-sider"
        style={{
          background: `linear-gradient(
            ${config.theme.gradient.direction}, 
            ${config.theme.gradient.colors.start}, 
            ${config.theme.gradient.colors.middle} 50%, 
            ${config.theme.gradient.colors.end}
          )`
        }}
      >
        <div className="logo-container">
          {!collapsed && <span className="logo-text">{config.title.full}</span>}
          {collapsed && <span className="logo-text">{config.title.collapsed}</span>}
        </div>
        
        <Menu 
          theme="light"
          selectedKeys={selectedKeys}
          mode="inline"
          className="custom-menu"
        >
          {config.menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
        
        <div className="sidebar-footer" style={{ background: config.theme.siderBg }} />
      </Sider>
    </ConfigProvider>
  );
};

export interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}
