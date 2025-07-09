# 预选按钮状态更新Bug修复

## 问题描述
预选课程成功后，预选按钮没有变更为"删除预选"按钮，仍然显示为"预选"按钮。

## 根本原因
预选成功后，只更新了课程的人数信息，但没有刷新`preselectedCourses`列表，导致：
1. `refreshCourseCapacity()`只更新了课程卡片的人数显示
2. `preselectedCourses`数组没有包含新预选的课程
3. CourseCard组件中的`isPreselected`判断为false
4. 按钮状态仍然显示为"预选"而不是"删除预选"

## CourseCard按钮状态判断逻辑
```typescript
// 检查是否已预选
const isPreselected = preselectedCourses.some(
  (preselectedCourse) => preselectedCourse.courseID === courseData.courseID && 
                        preselectedCourse.courseGroupID === courseData.courseGroupID
);

// 按钮显示逻辑
if (isSelected || isPreselected) {
  // 显示"退课"或"删除预选"按钮
  const buttonText = isPreselected ? '删除预选' : '退课';
} else {
  // 显示"选课"或"预选"按钮
}
```

## 修复方案
在每个成功操作后，除了更新课程人数，还需要调用`onDataRefresh()`来刷新我的课程列表：

### 1. 预选成功后
```typescript
new PreselectCourseMessage(userToken, course.courseID).send(
  (response: string) => {
    message.success('预选成功');
    // 更新课程人数显示
    refreshCourseCapacity(course.courseID);
    // 刷新我的课程数据，确保按钮状态更新
    onDataRefresh();
  }
);
```

### 2. 选课成功后
```typescript
new SelectCourseMessage(userToken, course.courseID).send(
  (response: string) => {
    message.success('选课成功');
    refreshCourseCapacity(course.courseID);
    onDataRefresh(); // 确保selectedCourses列表更新
  }
);
```

### 3. 删除预选成功后
```typescript
new RemovePreselectedCourseMessage(userToken, course.courseID).send(
  (response: string) => {
    message.success('删除预选成功');
    refreshCourseCapacity(course.courseID);
    onDataRefresh(); // 确保preselectedCourses列表更新
  }
);
```

### 4. 退课成功后
```typescript
new DropCourseMessage(userToken, course.courseID).send(
  (response: string) => {
    message.success('退课成功');
    refreshCourseCapacity(course.courseID);
    onDataRefresh(); // 确保selectedCourses列表更新
  }
);
```

## 修复后的数据流程

```
用户点击预选课程
    ↓
调用PreselectCourseMessage API
    ↓
API成功响应
    ↓
显示"预选成功"消息
    ↓
refreshCourseCapacity(courseID) - 更新人数显示
    ↓
onDataRefresh() - 重新获取preselectedCourses列表
    ↓
CourseCard重新渲染，isPreselected = true
    ↓
按钮显示变为"删除预选" ✅
```

## 修复效果
1. **预选成功**：按钮立即从"预选"变为"删除预选"
2. **选课成功**：按钮立即从"选课"变为"退课"
3. **删除预选成功**：按钮立即从"删除预选"变为"预选"
4. **退课成功**：按钮立即从"退课"变为"选课"
5. **人数同步**：课程人数也会同时更新显示

## 注意事项
- `onDataRefresh()`会重新获取所有我的课程数据，确保按钮状态与后端一致
- 失败情况下不调用`onDataRefresh()`，避免不必要的数据请求
- 人数更新和按钮状态更新是两个独立的操作，确保用户体验

---
*修复时间：2025年7月9日*
*修复类型：按钮状态同步*
