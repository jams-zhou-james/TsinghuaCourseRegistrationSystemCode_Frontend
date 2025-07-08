# 预选课程人数实时更新修复

## 🐛 问题描述

在课程选择页面，当用户点击"预选"或"删除预选"按钮后，课程卡片上的人数信息（如0/5 → 1/5）没有立即更新，需要刷新页面或重新搜索才能看到最新的人数。

## 🔍 问题原因

在 `CourseSelectionPage.tsx` 中调用 `useCourseActions` hook时，缺少了 `updateCourseCapacity` 参数的传递。

### 问题代码
```typescript
// ❌ 缺少 updateCourseCapacity 参数
const {
  handleSelectCourse,
  handlePreselectCourse,
  handleDropCourse
} = useCourseActions(userToken, semesterPhase, refreshData);
```

### 正确代码
```typescript
// ✅ 正确传递 updateCourseCapacity 参数
const {
  handleSelectCourse,
  handlePreselectCourse,
  handleDropCourse
} = useCourseActions(userToken, semesterPhase, refreshData, updateCourseCapacity);
```

## 🔧 修复方案

### 步骤1: 获取updateCourseCapacity函数
从 `useCourseData` 的返回值中解构 `updateCourseCapacity` 函数：

```typescript
const {
  courses,
  selectedCourses,
  preselectedCourses,
  waitingList,
  loading: dataLoading,
  error: dataError,
  fetchCourses,
  refreshData,
  updateCourseCapacity  // ← 添加这个
} = useCourseData(userToken, semesterPhase);
```

### 步骤2: 传递给useCourseActions
将 `updateCourseCapacity` 作为第四个参数传递给 `useCourseActions`：

```typescript
const {
  handleSelectCourse,
  handlePreselectCourse,
  handleDropCourse
} = useCourseActions(userToken, semesterPhase, refreshData, updateCourseCapacity);
```

## 🚀 修复效果

### ✅ 修复后的行为
1. **预选操作**: 点击"预选"后，人数立即从 0/5 更新为 1/5
2. **删除预选**: 点击"删除预选"后，人数立即从 1/5 更新为 0/5
3. **选课操作**: 点击"选课"后，人数立即更新
4. **退课操作**: 点击"退课"后，人数立即更新

### 🔄 技术实现
- `useCourseActions` 中的每个操作都会调用 `updateCourseCapacity(courseID, ±1)`
- `updateCourseCapacity` 在本地立即更新课程列表中的 `currentStudents` 字段
- 无需等待后端响应，提供即时的用户反馈

## 📁 修改文件

- **修改**: `src/Pages/Student/CourseSelectionPage.tsx`
  - 添加 `updateCourseCapacity` 的解构
  - 传递给 `useCourseActions` hook

## ✅ 验证项目

- [x] 预选操作后人数立即更新
- [x] 删除预选后人数立即恢复
- [x] 选课操作后人数立即更新  
- [x] 退课操作后人数立即恢复
- [x] 编译无错误
- [x] 其他功能正常工作

## 🔍 相关代码逻辑

### useCourseActions.ts
```typescript
const handlePreselectCourse = async (course: CourseDisplayData) => {
  new PreselectCourseMessage(userToken, course.courseID).send(
    (response: string) => {
      message.success('预选成功');
      updateCourseCapacity?.(course.courseID, 1);  // ← 人数+1
      onDataRefresh();
    },
    (error: string) => message.error('预选失败: ' + error)
  );
};
```

### useCourseData.ts
```typescript
const updateCourseCapacity = useCallback((courseID: number, changeAmount: number) => {
  setCourses(prevCourses => 
    prevCourses.map(course => 
      course.courseID === courseID 
        ? { 
            ...course, 
            currentStudents: Math.max(0, Math.min(course.capacity, course.currentStudents + changeAmount))
          }
        : course
    )
  );
}, []);
```

这个修复确保了用户在进行任何课程操作时都能看到即时的视觉反馈，大大提升了用户体验。
