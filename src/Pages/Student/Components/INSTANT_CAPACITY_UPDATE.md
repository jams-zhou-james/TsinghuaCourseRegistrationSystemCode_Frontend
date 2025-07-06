# 课程余量即时更新优化

## 优化说明

本次优化实现了选课/退课操作成功后，"所有课程"卡片上的课余量（人数）立即更新的功能，提升用户体验。

## 功能特性

### 1. 即时本地更新
- 预选成功后：立即将课程当前人数 +1
- 选课成功后：立即将课程当前人数 +1
- 删除预选后：立即将课程当前人数 -1（预选阶段）
- 退课成功后：立即将课程当前人数 -1（正选阶段）

### 2. 选课规则理解
- **预选阶段**：学生预选课程，占用课程容量，系统后续会从预选学生中随机抽取
- **正选阶段**：直接选课，立即确定选课结果
- **等待列表**：当课程容量满时，后续选课学生进入等待列表

### 3. 操作名称与API对应
- **预选阶段**：
  - 选课 → "预选" → `PreselectCourseMessage`
  - 退课 → "删除预选" → `RemovePreselectedCourseMessage`
- **正选阶段**：
  - 选课 → "选课" → `SelectCourseMessage`
  - 退课 → "退课" → `DropCourseMessage`

### 2. 安全性保障
- 使用 `Math.max(0, Math.min(capacity, newCount))` 确保人数在合理范围内
- 仅在操作成功后才进行本地更新
- 保持后端数据刷新机制不变，确保数据最终一致性

### 3. 用户体验提升
- 无需等待全量数据刷新即可看到余量变化
- 操作反馈更加及时和直观
- 避免因网络延迟导致的显示滞后

## 技术实现

### 核心函数：updateCourseCapacity

```typescript
// 本地更新课程余量，用于选课/退课后立即反馈
const updateCourseCapacity = useCallback((courseID: number, changeAmount: number) => {
  console.log(`本地更新课程 ${courseID} 的余量，变化量：${changeAmount}`);
  
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

### 选课操作集成

1. **预选阶段预选**：成功后 `updateCourseCapacity(courseID, 1)`
2. **预选阶段删除预选**：成功后 `updateCourseCapacity(courseID, -1)`
3. **正选阶段选课**：成功后 `updateCourseCapacity(courseID, 1)`
4. **正选阶段退课**：成功后 `updateCourseCapacity(courseID, -1)`

### 数据流程

```
用户点击选课/退课
     ↓
API 调用成功
     ↓
立即本地更新余量 (updateCourseCapacity)
     ↓
刷新"我的课程"数据 (refreshData)
     ↓
UI 即时反馈完成
```

## 文件修改

### 1. useCourseData.ts
- 新增 `updateCourseCapacity` 函数
- 在接口和返回值中暴露该函数
- 实现安全的本地状态更新逻辑

### 2. useCourseActions.ts
- 接收 `updateCourseCapacity` 参数
- 在选课/退课成功回调中调用该函数
- 区分预选和正选，仅在正选和退课时更新余量

### 3. CourseManagementContainer.tsx
- 从 `useCourseData` 获取 `updateCourseCapacity`
- 将其传递给 `useCourseActions`

## 测试场景

### 基础功能
- [x] 预选成功后课程人数立即 +1
- [x] 删除预选后课程人数立即 -1（预选阶段）
- [x] 选课成功后课程人数立即 +1（正选阶段）
- [x] 退课成功后课程人数立即 -1（正选阶段）
- [x] 根据学期阶段正确调用对应API和显示消息

### 边界情况
- [x] 人数不会超过课程容量上限
- [x] 人数不会低于 0
- [x] API 失败时不进行本地更新
- [x] 多次操作时数据正确累计

### 数据一致性
- [x] 本地更新与后端数据最终一致
- [x] 页面刷新后数据来源于服务器
- [x] 网络异常时的容错处理

## 后续扩展

1. **等待列表更新**：可考虑在选课成功时更新等待列表状态
2. **批量操作优化**：支持批量选课的即时更新
3. **动画效果**：为人数变化添加视觉过渡效果
4. **冲突检测优化**：实时更新课程冲突状态

## 注意事项

- 本地更新仅用于UI反馈，不替代服务器端的权威数据
- 在网络不稳定环境下，建议提醒用户刷新页面确认最新状态
- 预选和正选的业务逻辑差异已正确处理

---

此优化完成了任务要求中的"选课/退课/预选后，'所有课程'卡片上的课余量（人数）需立即更新（无需等待全量刷新）"功能。
