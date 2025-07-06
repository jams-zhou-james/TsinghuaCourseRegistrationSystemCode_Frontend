# 学期阶段优化修复说明

## 修复概述

根据用户需求，对选课系统进行了阶段性优化，确保在不同学期阶段只调用必要的API，并设置正确的默认显示页面。

## 具体修复内容

### 1. API调用优化

#### 阶段1（预选阶段）
- ✅ **只调用**：`QueryStudentPreselectedCoursesMessage` - 获取预选课程
- ✅ **不调用**：`QueryStudentSelectedCoursesMessage` - 已选课程API
- ✅ **不调用**：`QueryStudentWaitingListStatusMessage` - 等待列表API
- ✅ **清空状态**：selectedCourses 和 waitingList 数组

#### 阶段2（正选阶段）  
- ✅ **只调用**：`QueryStudentSelectedCoursesMessage` - 获取已选课程
- ✅ **只调用**：`QueryStudentWaitingListStatusMessage` - 获取等待列表
- ✅ **不调用**：`QueryStudentPreselectedCoursesMessage` - 预选课程API
- ✅ **清空状态**：preselectedCourses 数组

### 2. 默认页面跳转优化

#### 我的课程Tab默认激活
- ✅ **阶段1**：默认跳转到"预选课程"Tab
- ✅ **阶段2**：默认跳转到"已选课程"Tab

#### Tab显示过滤
- ✅ **阶段1**：只显示"预选课程"Tab，隐藏其他Tab
- ✅ **阶段2**：只显示"已选课程"和"等待列表"Tab，隐藏预选Tab

### 3. 修改的文件

#### useCourseData.ts
- 添加了 `semesterPhase` 参数
- 修改了 `refreshData` 函数的调用逻辑
- 修改了初始化 `useEffect` 的调用逻辑
- 添加了阶段判断和日志记录

#### MyCoursesTabs.tsx
- 添加了 `Phase` 导入
- 实现了 `getDefaultActiveKey()` 函数用于设置默认Tab
- 实现了 `getFilteredTabItems()` 函数用于过滤显示的Tab
- 添加了调试日志

#### CourseSelectionPage.tsx
- 向 `useCourseData` 传递 `semesterPhase` 参数
- 向 `MyCoursesTabs` 传递 `semesterPhase` 参数

### 4. 性能优化效果

- **减少API调用**：每个阶段减少2个不必要的API请求
- **提升用户体验**：用户进入"我的课程"时直接看到对应阶段的相关内容
- **简化界面**：隐藏当前阶段不相关的Tab，减少用户困惑

### 5. 调试信息

添加了详细的控制台日志，方便追踪：
- 阶段判断逻辑
- API调用决策
- Tab过滤和默认选择逻辑

## 使用方法

系统会自动根据当前学期阶段：
1. 智能调用相应的API
2. 设置正确的默认Tab
3. 隐藏不相关的Tab选项

用户无需额外操作，系统会自动优化体验。
