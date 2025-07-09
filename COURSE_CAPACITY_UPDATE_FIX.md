# 课程人数更新Bug修复文档

## 问题描述
预选课程成功后，前端课程卡片的人数信息没有及时更新显示。

## 根本原因分析
之前的`refreshCourseCapacity`函数存在以下问题：
1. 调用了`updateCourseCapacity(courseID, 0)`，但这个函数在`changeAmount=0`时不会真正更新人数
2. 延迟200ms调用`onDataRefresh()`，导致更新不及时且可能有竞争条件
3. 没有直接设置从后端获取的真实人数，而是依赖复杂的间接更新机制

## 修复方案

### 1. 新增`setCourseCapacity`函数
在`useCourseData.ts`中新增直接设置课程人数的函数：

```typescript
// 直接设置课程的最新人数（不是增减，而是直接设置）
const setCourseCapacity = useCallback((courseID: number, currentStudents: number, capacity: number) => {
  console.log(`直接设置课程 ${courseID} 的人数：${currentStudents}/${capacity}`);
  
  setCourses(prevCourses => 
    prevCourses.map(course => 
      course.courseID === courseID 
        ? { 
            ...course, 
            currentStudents: currentStudents,
            capacity: capacity
          }
        : course
    )
  );
}, []);
```

### 2. 更新接口定义
在`UseCourseDataResult`接口中添加新函数：
```typescript
setCourseCapacity: (courseID: number, currentStudents: number, capacity: number) => void;
```

### 3. 修改`refreshCourseCapacity`逻辑
在`useCourseActions.ts`中：

```typescript
const refreshCourseCapacity = (courseID: number) => {
  new QueryCourseByIDMessage(userToken, courseID).send(
    (response: string) => {
      const courseInfo = JSON.parse(response);
      const latestStudentCount = courseInfo.selectedStudentsSize + courseInfo.preselectedStudentsSize;
      
      // 直接设置最新的人数，立即更新显示
      if (setCourseCapacity) {
        setCourseCapacity(courseID, latestStudentCount, courseInfo.courseCapacity);
      }
    },
    (error: string) => {
      // 失败时触发完整数据刷新
      onDataRefresh();
    }
  );
};
```

### 4. 更新函数签名
修改`useCourseActions`的参数，添加`setCourseCapacity`：
```typescript
export const useCourseActions = (
  userToken: string,
  semesterPhase: SemesterPhase | null,
  onDataRefresh: () => void,
  updateCourseCapacity?: (courseID: number, changeAmount: number) => void,
  setCourseCapacity?: (courseID: number, currentStudents: number, capacity: number) => void
) => {
```

### 5. 更新调用方式
在`CourseSelectionPage.tsx`中传递新函数：
```typescript
const { setCourseCapacity } = useCourseData(userToken, semesterPhase);
const { ... } = useCourseActions(userToken, semesterPhase, refreshData, updateCourseCapacity, setCourseCapacity);
```

## 修复后的数据流程

```
用户点击预选课程
    ↓
调用PreselectCourseMessage API
    ↓
API成功响应
    ↓
调用refreshCourseCapacity(courseID)
    ↓
调用QueryCourseByIDMessage获取最新课程信息
    ↓
解析response获得最新人数
    ↓
调用setCourseCapacity直接更新该课程的显示人数
    ↓
课程卡片立即显示最新人数
```

## 优势
1. **即时更新**：不再依赖延迟和间接刷新
2. **精确控制**：直接设置真实人数，而不是增减计算
3. **高效**：只更新目标课程，不需要重新加载所有数据
4. **可靠**：避免了竞争条件和时序问题

## 测试要点
1. 预选课程后人数立即更新（如 5/30 → 6/30）
2. 预选失败时也能获取最新状态
3. 退课/删除预选后人数正确减少
4. 网络延迟情况下的表现
5. 多用户并发操作时的数据一致性

---
*修复时间：2025年7月9日*
*修复目标：课程人数即时更新显示*
