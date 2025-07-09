// courseUtils.ts - 课程数据转换工具函数
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { PairOfGroupAndCourse } from 'Plugins/CourseManagementService/Objects/PairOfGroupAndCourse';
import { QuerySafeUserInfoByUserIDMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDMessage';
import { QueryCourseGroupByIDMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupByIDMessage';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { CourseDisplayData } from '../hooks/useCourseActions';

// 教师姓名缓存
const teacherNameCache = new Map<number, string>();

// 课程组信息缓存
const courseGroupCache = new Map<number, CourseGroup>();

// 获取课程组信息（支持缓存）
const getCourseGroupInfo = async (courseGroupID: number, userToken: string): Promise<CourseGroup | null> => {
  if (courseGroupCache.has(courseGroupID)) {
    return courseGroupCache.get(courseGroupID)!;
  }

  return new Promise<CourseGroup | null>((resolve) => {
    // 设置5秒超时，防止API调用卡住
    const timeout = setTimeout(() => {
      console.warn(`获取课程组${courseGroupID}信息超时`);
      resolve(null);
    }, 5000);

    new QueryCourseGroupByIDMessage(userToken, courseGroupID).send(
      (response: string) => {
        clearTimeout(timeout);
        try {
          // 先检查response是否为有效JSON
          let courseGroup: CourseGroup;
          if (typeof response === 'string') {
            const parsed = JSON.parse(response);
            courseGroup = new CourseGroup(
              parsed.courseGroupID,
              parsed.name,
              parsed.credit,
              parsed.ownerTeacherID,
              parsed.authorizedTeachers
            );
          } else {
            courseGroup = response as CourseGroup;
          }
          
          courseGroupCache.set(courseGroupID, courseGroup);
          resolve(courseGroup);
        } catch (e) {
          console.error(`获取课程组${courseGroupID}信息失败:`, e, 'Response:', response);
          resolve(null);
        }
      },
      (error: string) => {
        clearTimeout(timeout);
        console.error(`获取课程组${courseGroupID}信息失败:`, error);
        resolve(null);
      }
    );
  });
};
const getTeacherName = async (teacherID: number): Promise<string> => {
  if (teacherNameCache.has(teacherID)) {
    return teacherNameCache.get(teacherID)!;
  }

  return new Promise<string>((resolve) => {
    // 设置5秒超时，防止API调用卡住
    const timeout = setTimeout(() => {
      const fallbackName = `教师${teacherID}`;
      teacherNameCache.set(teacherID, fallbackName);
      resolve(fallbackName);
    }, 5000);

    new QuerySafeUserInfoByUserIDMessage(teacherID).send(
      (response: string) => {
        clearTimeout(timeout);
        try {
          // 先检查response是否为有效JSON
          let teacherInfo: SafeUserInfo;
          if (typeof response === 'string') {
            teacherInfo = JSON.parse(response);
          } else {
            teacherInfo = response as any;
          }
          
          const fullName = teacherInfo.userName || `教师${teacherID}`;
          teacherNameCache.set(teacherID, fullName);
          resolve(fullName);
        } catch (e) {
          console.error(`获取教师${teacherID}信息失败:`, e, 'Response:', response);
          const fallbackName = `教师${teacherID}`;
          teacherNameCache.set(teacherID, fallbackName);
          resolve(fallbackName);
        }
      },
      (error: string) => {
        clearTimeout(timeout);
        console.error(`获取教师${teacherID}信息失败:`, error);
        const fallbackName = `教师${teacherID}`;
        teacherNameCache.set(teacherID, fallbackName);
        resolve(fallbackName);
      }
    );
  });
};

// 转换单个课程数据（通过PairOfGroupAndCourse）
const convertPairToDisplayData = async (
  pair: PairOfGroupAndCourse,
  selectedCourseIds: number[] = [],
  preselectedCourseIds: number[] = []
): Promise<CourseDisplayData> => {
  const course = pair.Course;
  const courseGroup = pair.CourseGroup;
  
  const teacherName = await getTeacherName(course.teacherID);
  
  // 格式化时间显示（多行显示，严格按照原始逻辑）
  const formatSchedule = (times: any[]): string => {
    if (!times || times.length === 0) return '时间待定';
    
    const dayNames: { [key: string]: string } = {
      'MONDAY': '周一', 'TUESDAY': '周二', 'WEDNESDAY': '周三',
      'THURSDAY': '周四', 'FRIDAY': '周五', 'SATURDAY': '周六', 'SUNDAY': '周日'
    };
    
    const timeNames: { [key: string]: string } = {
      'FIRST_SECOND': '8:00-9:35',
      'THIRD_FOURTH': '9:50-11:25',
      'FIFTH_SIXTH': '13:30-15:05',
      'SEVENTH_EIGHTH': '15:20-16:55',
      'NINTH_TENTH': '19:20-20:55'
    };
    
    return times.map(time => {
      // 处理可能的枚举对象格式
      const dayOfWeek = typeof time.dayOfWeek === 'object' ? time.dayOfWeek.name : time.dayOfWeek;
      const timePeriod = typeof time.timePeriod === 'object' ? time.timePeriod.name : time.timePeriod;
      
      const dayStr = dayNames[dayOfWeek] || dayOfWeek;
      const timeStr = timeNames[timePeriod] || timePeriod;
      
      return `${dayStr} ${timeStr}`;
    }).join('\n'); // 用换行符分隔，确保多行显示
  };

  return {
    courseID: course.courseID,
    courseName: courseGroup.name, // 课程名称从CourseGroup获取
    teacher: teacherName,
    schedule: formatSchedule(course.time),
    location: course.location || '待定',
    currentStudents: course.selectedStudentsSize + course.preselectedStudentsSize,
    capacity: course.courseCapacity,
    credit: courseGroup.credit, // 学分从CourseGroup获取
    introduction: '', // CourseInfo中没有introduction字段
    courseGroupID: course.courseGroupID,
    isConflicted: false // 移除前端时间冲突检查，全部交由后端处理
  };
};

// 转换单个课程数据（仅CourseInfo，用于已选课程等）
const convertCourseToDisplayData = async (
  course: CourseInfo,
  userToken: string,
  courseGroup?: CourseGroup,
  selectedCourseIds: number[] = [],
  preselectedCourseIds: number[] = []
): Promise<CourseDisplayData> => {
  const teacherName = await getTeacherName(course.teacherID);
  
  // 如果没有提供courseGroup，尝试通过API获取
  let actualCourseGroup = courseGroup;
  if (!actualCourseGroup && course.courseGroupID) {
    actualCourseGroup = await getCourseGroupInfo(course.courseGroupID, userToken);
  }
  
  // 格式化时间显示（多行显示，严格按照原始逻辑）
  const formatSchedule = (times: any[]): string => {
    if (!times || times.length === 0) return '时间待定';
    
    const dayNames: { [key: string]: string } = {
      'MONDAY': '周一', 'TUESDAY': '周二', 'WEDNESDAY': '周三',
      'THURSDAY': '周四', 'FRIDAY': '周五', 'SATURDAY': '周六', 'SUNDAY': '周日'
    };
    
    const timeNames: { [key: string]: string } = {
      'FIRST_SECOND': '8:00-9:35',
      'THIRD_FOURTH': '9:50-11:25',
      'FIFTH_SIXTH': '13:30-15:05',
      'SEVENTH_EIGHTH': '15:20-16:55',
      'NINTH_TENTH': '19:20-20:55'
    };
    
    return times.map(time => {
      // 处理可能的枚举对象格式
      const dayOfWeek = typeof time.dayOfWeek === 'object' ? time.dayOfWeek.name : time.dayOfWeek;
      const timePeriod = typeof time.timePeriod === 'object' ? time.timePeriod.name : time.timePeriod;
      
      const dayStr = dayNames[dayOfWeek] || dayOfWeek;
      const timeStr = timeNames[timePeriod] || timePeriod;
      
      return `${dayStr} ${timeStr}`;
    }).join('\n'); // 用换行符分隔，确保多行显示
  };

  return {
    courseID: course.courseID,
    courseName: actualCourseGroup?.name || `课程${course.courseID}`, // 优先使用真实的课程组名称
    teacher: teacherName,
    schedule: formatSchedule(course.time),
    location: course.location || '待定',
    currentStudents: course.selectedStudentsSize + course.preselectedStudentsSize,
    capacity: course.courseCapacity,
    credit: actualCourseGroup?.credit || 0, // 使用真实的课程组学分
    introduction: '',
    courseGroupID: course.courseGroupID,
    isConflicted: false
  };
};

// 获取星期名称
const getDayName = (dayOfWeek: any): string => {
  const dayMap: { [key: string]: string } = {
    'MONDAY': '周一', 'TUESDAY': '周二', 'WEDNESDAY': '周三',
    'THURSDAY': '周四', 'FRIDAY': '周五', 'SATURDAY': '周六', 'SUNDAY': '周日'
  };
  
  if (typeof dayOfWeek === 'string') {
    return dayMap[dayOfWeek] || dayOfWeek;
  }
  if (typeof dayOfWeek === 'object' && dayOfWeek.name) {
    return dayMap[dayOfWeek.name] || dayOfWeek.name;
  }
  return '未知';
};

// 获取时间段字符串
const getPeriodString = (timePeriod: any): string => {
  const timeMap: { [key: string]: string } = {
    'FIRST_SECOND': '8:00-9:35',
    'THIRD_FOURTH': '9:50-11:25',
    'FIFTH_SIXTH': '13:30-15:05',
    'SEVENTH_EIGHTH': '15:20-16:55',
    'NINTH_TENTH': '19:20-20:55'
  };
  
  if (typeof timePeriod === 'string') {
    return timeMap[timePeriod] || timePeriod;
  }
  if (typeof timePeriod === 'object' && timePeriod.name) {
    return timeMap[timePeriod.name] || timePeriod.name;
  }
  return '未知时间';
};

// 批量转换课程数据（PairOfGroupAndCourse）
const transformPairsToDisplayData = async (
  pairs: PairOfGroupAndCourse[],
  selectedCourseIds: number[] = [],
  preselectedCourseIds: number[] = []
): Promise<CourseDisplayData[]> => {
  const transformPromises = pairs.map(pair => 
    convertPairToDisplayData(pair, selectedCourseIds, preselectedCourseIds)
  );
  
  return await Promise.all(transformPromises);
};

// 批量转换课程数据（仅CourseInfo）
const transformCoursesToDisplayData = async (
  courses: CourseInfo[],
  userToken: string,
  selectedCourseIds: number[] = [],
  preselectedCourseIds: number[] = []
): Promise<CourseDisplayData[]> => {
  const transformPromises = courses.map(course => 
    convertCourseToDisplayData(course, userToken, undefined, selectedCourseIds, preselectedCourseIds)
  );
  
  return await Promise.all(transformPromises);
};

export const courseUtils = {
  getTeacherName,
  convertCourseToDisplayData,
  convertPairToDisplayData,
  transformCoursesToDisplayData,
  transformPairsToDisplayData,
  getDayName,
  getPeriodString
};
