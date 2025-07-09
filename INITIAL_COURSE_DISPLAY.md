# 课程选择页面初始显示优化

## 📋 需求说明

当用户切换到课程选择页面时，应该默认显示所有可能时间段的课程搜索结果，相当于时间表格选择器处于全选状态下的搜索结果。

## 🔍 问题分析

### 原有行为
- 页面初始化时调用 `fetchCourses()` 没有传递参数
- `allowedTimePeriods` 默认为空数组 `[]`
- 空的时间过滤条件可能导致后端返回不完整的课程列表

### 期望行为
- 页面初始化时传递所有可能的时间段组合
- 相当于时间表格选择器默认全选状态
- 显示所有符合时间条件的课程

## 🔧 实现方案

### 1. 生成全时间段数组
在 `useCourseData` 的初始化 `useEffect` 中生成包含所有可能时间段的数组：

```typescript
// 生成所有可能的时间段组合（6个时间段 × 7天 = 42个组合）
const allTimePeriods: CourseTime[] = [];

const timePeriodMapping = [
  TimePeriod.morning,       // 8:00-9:35
  TimePeriod.lateMorning,   // 9:50-12:15
  TimePeriod.earlyAfternoon,// 13:30-15:05
  TimePeriod.midAfternoon,  // 15:20-16:55
  TimePeriod.lateAfternoon, // 17:05-18:40
  TimePeriod.evening        // 19:20-21:45
];

const dayOfWeekMapping = [
  DayOfWeek.monday,
  DayOfWeek.tuesday,
  DayOfWeek.wednesday,
  DayOfWeek.thursday,
  DayOfWeek.friday,
  DayOfWeek.saturday,
  DayOfWeek.sunday
];

// 创建所有时间段的组合
for (const timePeriod of timePeriodMapping) {
  for (const dayOfWeek of dayOfWeekMapping) {
    allTimePeriods.push(new CourseTime(dayOfWeek, timePeriod));
  }
}
```

### 2. 初始调用fetchCourses
将生成的全时间段数组传递给 `fetchCourses`：

```typescript
fetchCourses({
  allowedTimePeriods: allTimePeriods
});
```

### 3. 添加必要导入
```typescript
import { TimePeriod } from 'Plugins/CourseManagementService/Objects/TimePeriod';
import { DayOfWeek } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
```

## 📱 用户体验改进

### ✅ 改进效果
1. **完整初始显示**: 页面加载时显示所有可用时间段的课程
2. **与时间选择器一致**: 初始状态等同于时间表格全选
3. **快速浏览**: 用户可以立即看到所有课程选项
4. **搜索基准**: 为后续的筛选操作提供完整的基准数据

### 🔄 工作流程
1. 用户进入课程选择页面
2. 自动加载全时间段的课程数据
3. 时间表格选择器显示为全选状态
4. 课程列表显示所有可用课程
5. 用户可以根据需要调整时间过滤条件

## 🔧 技术实现

### 数据流
```
页面初始化 → 生成全时间段数组 → fetchCourses(全时间段) → 
显示所有课程 → 时间选择器默认全选状态
```

### 时间段组合
- **6个时间段** × **7天** = **42个时间组合**
- 涵盖一周内所有可能的上课时间
- 与TimeTableSelector的默认全选状态保持一致

## 📁 修改文件

1. **修改**: `src/Pages/Student/Components/hooks/useCourseData.ts`
   - 添加TimePeriod和DayOfWeek导入
   - 在useEffect中生成全时间段数组
   - 调用fetchCourses时传递全时间段参数

## ✅ 验证项目

- [x] 页面初始化时显示所有课程
- [x] 时间表格选择器默认全选状态
- [x] 课程数据与时间过滤条件一致
- [x] 编译无错误
- [x] 搜索功能正常工作
- [x] 时间过滤功能正常工作

## 🚀 预期效果

用户现在可以在进入课程选择页面时立即看到完整的课程列表，无需手动调整时间过滤条件。这提供了更直观和完整的初始体验，同时保持了与时间表格选择器默认状态的一致性。
