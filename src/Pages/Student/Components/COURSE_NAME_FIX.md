# 课程名称显示修复说明

## 修复概述

修复了"我的课程"界面中课程名称显示为"课程2"、"课程3"等通用格式的问题，现在会显示真实的课程组名称。

## 问题分析

### 原因
在"我的课程"界面中，已选课程和预选课程的数据来源于`QueryStudentSelectedCoursesMessage`和`QueryStudentPreselectedCoursesMessage` API，这些API只返回`CourseInfo`对象，不包含`CourseGroup`信息。而课程的真实名称存储在`CourseGroup.name`字段中，不在`CourseInfo`中。

### 修复前
- 显示：`课程2`、`课程3`、`课程123`等
- 原因：使用fallback格式 `课程${course.courseID}`

### 修复后  
- 显示：真实的课程组名称，如`高等数学`、`程序设计基础`等
- 原因：通过API获取真实的CourseGroup信息

## 技术实现

### 1. 添加CourseGroup信息获取功能

#### 新增API调用
```typescript
// 新增：QueryCourseGroupByIDMessage API调用
import { QueryCourseGroupByIDMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupByIDMessage';
```

#### 新增缓存机制
```typescript
// 课程组信息缓存
const courseGroupCache = new Map<number, CourseGroup>();
```

#### 新增获取函数
```typescript
const getCourseGroupInfo = async (courseGroupID: number, userToken: string): Promise<CourseGroup | null>
```

### 2. 修改核心转换函数

#### convertCourseToDisplayData函数
- **新增参数**：`userToken: string`（必需）
- **智能获取**：如果没有提供courseGroup，自动通过API获取
- **优先级**：优先使用传入的courseGroup，否则通过API获取

#### transformCoursesToDisplayData函数
- **新增参数**：`userToken: string`
- **批量处理**：支持批量获取课程组信息

### 3. 性能优化特性

#### 缓存机制
- **教师姓名缓存**：避免重复API调用
- **课程组信息缓存**：避免重复API调用
- **超时保护**：5秒超时，防止API卡住

#### 错误处理
- **API失败时的fallback**：仍显示`课程${courseID}`格式
- **详细日志**：便于调试和问题追踪

## 修改的文件

### courseUtils.ts
- ✅ 添加了`getCourseGroupInfo`函数
- ✅ 修改了`convertCourseToDisplayData`函数签名
- ✅ 修改了`transformCoursesToDisplayData`函数签名
- ✅ 添加了课程组信息缓存

### useCourseData.ts
- ✅ 更新了`transformCoursesToDisplayData`调用
- ✅ 更新了`convertCourseToDisplayData`调用
- ✅ 传递userToken参数

## 效果对比

### 修复前：
```
我的课程:
- 课程2 (教师: 张三)
- 课程15 (教师: 李四)  
- 课程7 (教师: 王五)
```

### 修复后：
```
我的课程:
- 高等数学 (教师: 张三)
- 程序设计基础 (教师: 李四)
- 英语写作 (教师: 王五)
```

## 兼容性

- ✅ **向后兼容**：如果API调用失败，仍显示原有的fallback格式
- ✅ **性能友好**：缓存机制减少重复API调用
- ✅ **错误容忍**：网络问题不会导致页面崩溃
- ✅ **超时保护**：防止长时间等待

## 使用方法

系统会自动：
1. 检测缺失的课程组信息
2. 通过API获取真实课程名称
3. 缓存结果以提高性能
4. 在界面上显示真实课程名称

用户无需任何额外操作，修复后的效果会自动生效。
