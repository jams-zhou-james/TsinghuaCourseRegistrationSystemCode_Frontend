// 紫色主题配置
const purpleTheme = {
  components: {
    Menu: {
      darkItemBg: '#722ed1',
      darkItemSelectedBg: '#9254de',
      darkItemHoverBg: '#b37feb',
    },
    Layout: {
      siderBg: '#722ed1',
    }
  }
};

// 蓝色主题配置
const blueTheme = {
  components: {
    Menu: {
      darkItemBg: '#1890ff',
      darkItemSelectedBg: '#40a9ff',
      darkItemHoverBg: '#69c0ff',
    },
    Layout: {
      siderBg: '#1890ff',
    }
  }
};

const pinkTheme = {
  components: {
    Menu: {
      darkItemBg: '#ff85c0',  // 粉色背景
      darkItemSelectedBg: '#ffadd2',  // 选中项稍亮的粉色
      darkItemHoverBg: '#ffd6e7',  // 悬停时更亮的粉色
      darkItemColor: 'rgba(0, 0, 0, 0.85)',  // 深色文字提高可读性
      darkItemSelectedColor: 'rgba(0, 0, 0, 0.95)',  // 选中项更深文字
    },
    Layout: {
      siderBg: '#ff85c0',  // 侧边栏背景与菜单一致
    }
  },
  token: {
    colorPrimary: '#ff85c0',  // 主色也设为粉色
  }
};

export { purpleTheme, blueTheme, pinkTheme };