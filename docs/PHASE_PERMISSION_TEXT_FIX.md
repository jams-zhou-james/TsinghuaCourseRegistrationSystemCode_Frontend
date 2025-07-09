# 选课阶段权限显示文本修复

## 问题描述

在选课中心页面的阶段信息显示中，预选阶段（Phase.phase1）的权限文本显示不准确，显示的是"可以选课"和"可以退课"，但应该显示"可以预选课程"和"可以删除预选课程"。

## 修复内容

### 修复前
```tsx
<Text type="secondary" style={{ marginLeft: 16 }}>
  {semesterPhase.permissions.allowStudentSelect ? '可以选课' : '不可选课'} | 
  {semesterPhase.permissions.allowStudentDrop ? '可以退课' : '不可退课'}
</Text>
```

### 修复后
```tsx
<Text type="secondary" style={{ marginLeft: 16 }}>
  {semesterPhase.currentPhase === Phase.phase1 ? (
    <>
      {semesterPhase.permissions.allowStudentSelect ? '可以预选课程' : '不可以预选课程'} | 
      {semesterPhase.permissions.allowStudentDrop ? '可以删除预选课程' : '不可以删除预选课程'}
    </>
  ) : (
    <>
      {semesterPhase.permissions.allowStudentSelect ? '可以选课' : '不可选课'} | 
      {semesterPhase.permissions.allowStudentDrop ? '可以退课' : '不可退课'}
    </>
  )}
</Text>
```

## 修复效果

### 预选阶段（Phase.phase1）
- ✅ **选课权限**：显示"可以预选课程" / "不可以预选课程"
- ✅ **退课权限**：显示"可以删除预选课程" / "不可以删除预选课程"

### 正选阶段（Phase.phase2）
- ✅ **选课权限**：显示"可以选课" / "不可选课"
- ✅ **退课权限**：显示"可以退课" / "不可退课"

## 技术实现

### 条件渲染逻辑
- 根据 `semesterPhase.currentPhase` 判断当前阶段
- 预选阶段使用预选相关的文本
- 正选阶段使用选课相关的文本
- 保持权限状态判断逻辑不变

### 用户体验改进
- **术语准确性**：使用符合实际功能的术语
- **阶段区分**：明确区分不同阶段的操作类型
- **信息清晰**：用户能清楚了解当前可执行的操作

## 文件修改

**修改文件**：`src/Pages/Student/CourseSelectionPage.tsx`

**修改位置**：页面标题下方的权限状态显示区域

## 验证结果

- ✅ 编译通过，无 TypeScript 错误
- ✅ 逻辑正确，根据阶段显示对应文本
- ✅ 用户体验改善，术语更加准确

现在选课中心的权限显示文本能够准确反映当前阶段的操作类型，提升了用户理解的准确性！
