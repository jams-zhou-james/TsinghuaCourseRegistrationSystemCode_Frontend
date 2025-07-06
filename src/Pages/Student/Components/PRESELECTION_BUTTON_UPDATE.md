# 预选阶段按钮文字更新

## 更新说明

根据业务需求，将预选阶段的"退课"按钮文字更新为"删除预选"，使操作名称更加准确地反映实际功能。

## 更新内容

### 1. 按钮文字更新

| 阶段 | 课程状态 | 旧按钮文字 | 新按钮文字 |
|------|----------|------------|------------|
| 预选阶段 | 已预选 | "退课" ❌ | "删除预选" ✅ |
| 正选阶段 | 已选择 | "退课" ✅ | "退课" ✅ |

### 2. 确认对话框更新

| 阶段 | 课程状态 | 对话框标题 | 对话框内容 |
|------|----------|------------|------------|
| 预选阶段 | 已预选 | "确认删除预选" | "确定要删除预选《课程名》吗？" |
| 正选阶段 | 已选择 | "确认退课" | "确定要退课《课程名》吗？" |

## 技术实现

### 1. CourseCard.tsx 更新

```typescript
interface CourseCardProps {
  // ...existing props...
  semesterPhase?: SemesterPhase | null; // 新增
}

const getActionButton = () => {
  if (isSelected || isPreselected) {
    // 根据课程状态确定按钮文字
    const buttonText = isPreselected ? '删除预选' : '退课';
    
    return (
      <Button type="primary" danger onClick={handleAction}>
        {buttonText}
      </Button>
    );
  }
  // ...rest of the logic
};
```

### 2. MyCoursesTabs.tsx 更新

```typescript
const renderCourseCard = (course: CourseDisplayData, status: 'selected' | 'preselected' | 'waiting') => {
  const handleDrop = () => {
    // 根据课程状态确定操作文字
    const actionText = status === 'preselected' ? '删除预选' : '退课';
    const confirmTitle = status === 'preselected' ? '确认删除预选' : '确认退课';
    
    Modal.confirm({
      title: confirmTitle,
      content: `确定要${actionText}《${course.courseName}》吗？`,
      onOk: () => onDropCourse(course),
    });
  };
  
  // 按钮文字也相应更新
  actions: [
    <Button onClick={handleDrop}>
      {status === 'preselected' ? '删除预选' : '退课'}
    </Button>
  ]
};
```

### 3. CourseList.tsx 更新

传递 `semesterPhase` 给 `CourseCard`：

```typescript
<CourseCard
  // ...existing props...
  semesterPhase={semesterPhase}
  // ...rest of props...
/>
```

## 用户体验提升

### 1. 语义准确性
- **预选阶段**：使用"删除预选"更准确地描述操作
- **正选阶段**：保持"退课"的传统用词

### 2. 操作区分
- 用户能够明确区分预选和正选的不同操作
- 减少用户对操作后果的困惑

### 3. 一致性
- 确认对话框文字与按钮文字保持一致
- 所有相关界面统一更新

## 文件修改列表

- ✅ `CourseCard.tsx` - 主课程卡片组件
- ✅ `MyCoursesTabs.tsx` - 我的课程标签页组件  
- ✅ `CourseList.tsx` - 课程列表组件
- ✅ API调用逻辑 (`useCourseActions.ts`) - 之前已更新

## 测试验证

### 功能测试
- [x] 预选阶段显示"删除预选"按钮
- [x] 正选阶段显示"退课"按钮
- [x] 确认对话框文字正确
- [x] API调用逻辑正确

### 界面测试
- [x] "所有课程"标签页按钮文字正确
- [x] "我的课程"标签页按钮文字正确
- [x] 各种屏幕尺寸下显示正常

### 边界情况
- [x] 无学期阶段信息时的默认行为
- [x] 课程状态切换时的文字更新
- [x] 编译无错误

## 后续扩展

1. **国际化支持**：可将按钮文字提取为配置项
2. **主题适配**：确保按钮文字在不同主题下清晰可见
3. **无障碍优化**：为按钮添加更详细的aria-label

---

此更新完成了用户界面的语义准确性提升，使操作名称与实际功能完全对应。
