// Components/Sidebars/ConfigurableSidebar.tsx
import { ConfigProvider, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import React from 'react';
import './ConfigurableSidebar.css'; // 使用原版CSS逻辑

const { Sider } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode; // 直接要求传入JSX元素（如<HomeOutlined />）
  label: string;
  path: string;
}

interface SidebarConfig {
  theme: {
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

const ConfigurableSidebar: React.FC<ConfigurableSidebarProps> = ({ 
  collapsed, 
  onCollapse,
  config 
}) => {
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
        style={{ background: config.theme.siderBg }} // 双重保障
      >
        <div className="logo-container">
          {!collapsed && <span className="logo-text">{config.title.full}</span>}
          {collapsed && <span className="logo-text">{config.title.collapsed}</span>}
        </div>
        
        <Menu 
          theme="light"
          defaultSelectedKeys={['1']} 
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

export default ConfigurableSidebar;