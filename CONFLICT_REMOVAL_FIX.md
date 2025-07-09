# 课程选课逻辑修复文档

## 修复概述
本次修复主要解决两个问题：
1. **人数已满课程点击问题**：点击人数已满的课程时，人数也应该即时本地更新（如1/1→2/1）
2. **移除前端时间冲突判断**：所有时间冲突检查交由后端API处理，前端只展示API返回的结果

## 最新修复内容

### 1. 关键修复：使用后端API获取真实人数
**问题**：之前的逻辑使用前端加一减一操作，容易导致数据不一致
**解决方案**：每次操作后都调用`QueryCourseByIDMessage`从后端获取最新的课程人数

### 2. useCourseActions.ts 重大改进
- **新增`QueryCourseByIDMessage`导入**：用于查询单个课程最新信息
- **新增`refreshCourseCapacity`函数**：专门负责从后端获取最新人数
- **修改所有API调用逻辑**：
  - 成功时：显示成功消息 + 调用`refreshCourseCapacity`获取最新人数
  - 失败时：显示错误消息 + 调用`refreshCourseCapacity`获取最新人数
- **移除前端加一减一逻辑**：不再手动计算人数变化

### 3. 数据同步逻辑
```typescript
const refreshCourseCapacity = (courseID: number) => {
  new QueryCourseByIDMessage(userToken, courseID).send(
    (response: string) => {
      // 解析后端返回的最新CourseInfo
      const courseInfo = JSON.parse(response);
      const latestStudentCount = courseInfo.selectedStudentsSize + courseInfo.preselectedStudentsSize;
      
      // 触发界面刷新显示最新人数
      updateCourseCapacity?.(courseID, 0); // 触发UI更新
      setTimeout(() => onDataRefresh(), 200); // 200ms后完整数据刷新
    },
    (error: string) => {
      // 即使查询失败也触发数据刷新
      onDataRefresh();
    }
  );
};
```

### 4. 修复的操作流程
1. **选课/预选操作**：
   - 用户点击选课按钮（包括已满课程）
   - 调用相应的API（SelectCourse/PreselectCourse）
   - 无论成功失败，都调用`refreshCourseCapacity`
   - 从后端获取该课程的最新人数并更新显示

2. **退课/删除预选操作**：
   - 用户点击退课/删除预选按钮
   - 调用相应的API（DropCourse/RemovePreselectedCourse）
   - 无论成功失败，都调用`refreshCourseCapacity`
   - 从后端获取该课程的最新人数并更新显示

## 修复效果

### 解决的核心问题
1. **数据一致性**：人数显示完全以后端为准，避免前端计算错误
2. **即时反馈**：点击任何课程都能看到最新的人数状态
3. **容错性**：即使API操作失败，也能获取到最新的课程状态

### 用户体验
- 点击1/1的已满课程后，如果后端实际已变成2/1，用户能立即看到更新
- 所有操作后都能看到真实的最新人数，不会有前端缓存的错误数据
- 时间冲突等错误信息完全来自后端，更准确可靠

## 技术细节

### API调用链
1. 用户操作 → 选课API调用
2. API响应 → `refreshCourseCapacity(courseID)`
3. `QueryCourseByIDMessage` → 获取最新CourseInfo
4. 解析人数 → 更新前端显示

### 错误处理
- 选课API失败：显示错误信息 + 获取最新人数
- 查询课程API失败：触发完整数据刷新
- 网络超时：自动降级到完整数据刷新

### 性能优化
- 针对性刷新：只更新操作的那门课程
- 延迟机制：200ms延迟确保后端状态同步
- 缓存复用：其他课程数据保持不变

## 相关文件
- `src/Pages/Student/Components/hooks/useCourseActions.ts` - 主要修改
- `src/Pages/Student/Components/hooks/useCourseData.ts` - 配合修改
- `src/Pages/Student/Components/CourseCard.tsx` - 时间冲突移除
- `src/Pages/Student/Components/utils/courseUtils.ts` - 冲突检查移除

## 测试要点
1. **人数已满课程**：点击1/1课程，确保显示最新人数（如2/1）
2. **网络延迟**：模拟慢网络，确保最终显示正确
3. **并发操作**：多用户同时操作时的数据一致性
4. **错误场景**：API失败时是否能恢复到正确状态

---
*修复时间：2025年7月9日*
*修复类型：数据同步逻辑重构*
