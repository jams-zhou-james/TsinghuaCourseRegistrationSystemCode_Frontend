# 学生选课页面组件结构

本次重构将原本的大型 `CourseSelectionPage.tsx` 文件拆分为多个小组件，提升了代码的可维护性和可读性。

## 文件结构

```
src/Pages/Student/
├── CourseSelectionPage.tsx          # 主页面，负责数据管理和组件协调
└── Components/                      # 子组件文件夹
    ├── index.ts                     # 组件导出文件
    ├── CourseSearchForm.tsx         # 课程搜索表单组件
    ├── CourseCard.tsx              # 单个课程卡片组件
    ├── CourseList.tsx              # 课程列表组件
    └── MyCoursesTabs.tsx           # 我的课程标签页组件
```

## 组件职责

### 1. CourseSelectionPage.tsx (主页面)
- **职责**: 数据获取、状态管理、API调用、组件协调
- **功能**: 
  - 用户信息和学期阶段管理
  - 课程数据的加载和转换
  - 选课/预选/退课业务逻辑
  - 子组件的数据传递和事件处理

### 2. CourseSearchForm.tsx (搜索表单组件)
- **职责**: 课程搜索功能的UI和交互
- **功能**:
  - 搜索表单的渲染和验证
  - 搜索条件的收集和提交
  - 搜索状态的显示

### 3. CourseCard.tsx (课程卡片组件)
- **职责**: 单个课程信息的展示和操作
- **功能**:
  - 课程基本信息展示
  - 选课状态标识
  - 选课/退课按钮和逻辑
  - 时间冲突检查提示

### 4. CourseList.tsx (课程列表组件)
- **职责**: 课程列表的布局和渲染
- **功能**:
  - 课程卡片的网格布局
  - 加载状态和空状态处理
  - 响应式设计

### 5. MyCoursesTabs.tsx (我的课程标签页组件)
- **职责**: 学生已选课程的分类展示
- **功能**:
  - 已选课程、预选课程、等待列表的分类展示
  - 课程信息的紧凑展示
  - 退课操作

## 数据接口

### CourseDisplayData
```typescript
interface CourseDisplayData {
  courseID: number;
  courseName: string;
  teacher: string;
  schedule: string;
  location: string;
  currentStudents: number;
  capacity: number;
  credit: number;
  introduction?: string;
  courseGroupID: number;
  isConflicted: boolean;
}
```

## 重构优势

1. **代码可维护性提升**: 每个组件职责明确，便于维护和修改
2. **代码复用性增强**: 组件可以在其他页面中复用
3. **开发效率提高**: 多人可以同时开发不同组件
4. **测试更容易**: 每个组件可以单独测试
5. **代码可读性更好**: 文件更小，逻辑更清晰

## 注意事项

- 保持了原有的页面功能和UI不变
- 所有组件都保持了原有的样式风格
- API调用和数据流保持不变
- 权限控制和业务逻辑保持一致
