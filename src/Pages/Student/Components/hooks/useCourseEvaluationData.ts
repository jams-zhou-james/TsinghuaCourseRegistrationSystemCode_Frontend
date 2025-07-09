// useCourseEvaluationData.ts - 课程评价数据管理
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { QueryCoursesByFilterMessage } from 'Plugins/CourseManagementService/APIs/QueryCoursesByFilterMessage';
import { QueryStudentSelectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentSelectedCoursesMessage';
import { QueryCourseGroupByIDMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupByIDMessage';
import { QueryCourseEvaluationsMessage } from 'Plugins/CourseEvaluationService/APIs/QueryCourseEvaluationsMessage';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { QuerySafeUserInfoByUserIDListMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDListMessage';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { DayOfWeek } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod } from 'Plugins/CourseManagementService/Objects/TimePeriod';
import { CourseEvaluation } from 'Plugins/CourseEvaluationService/Objects/CourseEvaluation';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { PairOfGroupAndCourse } from 'Plugins/CourseManagementService/Objects/PairOfGroupAndCourse';
import { sendMessage } from 'Plugins/CommonUtils/Send/SendMessage';

// 课程显示信息（包含基本信息和显示所需的名称）
export interface CourseDisplayInfo {
  courseID: number;
  courseName: string;
  teacherName: string;
  semester: string;
  courseGroupID: number;
}

// 课程评价数据
export interface CourseEvaluationData {
  courseID: number;
  rating: number;
  feedback: string;
  lastUpdated?: Date;
}

// 编辑中的评价
export interface EditingEvaluation {
  courseID: number;
  rating: number;
  feedback: string;
}

// 其他同学的评价信息
export interface PublicEvaluationInfo {
  evaluatorName: string;
  rating: number;
  feedback: string;
  evaluatedAt?: Date;
}

// 查询课程的搜索条件
export interface CourseSearchCriteria {
  courseName?: string;
  teacherName?: string;
  courseGroupID?: number;
}

export interface UseCourseEvaluationDataResult {
  // 课程数据
  eligibleCourses: CourseDisplayInfo[];
  allCourses: CourseDisplayInfo[];
  filteredCourses: CourseDisplayInfo[];
  
  // 评价数据
  existingEvaluations: CourseEvaluationData[];
  courseEvaluations: PublicEvaluationInfo[];
  
  // 状态
  loading: boolean;
  searchLoading: boolean;
  evaluationsLoading: boolean;
  
  // 选中的课程
  selectedCourseForView: number | null;
  
  // 方法
  handleCourseSearch: (searchCriteria: CourseSearchCriteria) => void;
  handleViewCourseEvaluations: (courseID: number) => Promise<void>;
  resetSearch: () => void;
  getExistingEvaluation: (courseID: number) => CourseEvaluationData | undefined;
}

export const useCourseEvaluationData = (
  userToken: string, 
  canEvaluate: boolean
): UseCourseEvaluationDataResult => {
  const [loading, setLoading] = useState<boolean>(true);
  const [eligibleCourses, setEligibleCourses] = useState<CourseDisplayInfo[]>([]);
  const [existingEvaluations, setExistingEvaluations] = useState<CourseEvaluationData[]>([]);
  const [allCourses, setAllCourses] = useState<CourseDisplayInfo[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseDisplayInfo[]>([]);
  const [selectedCourseForView, setSelectedCourseForView] = useState<number | null>(null);
  const [courseEvaluations, setCourseEvaluations] = useState<PublicEvaluationInfo[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [evaluationsLoading, setEvaluationsLoading] = useState<boolean>(false);

  // 获取所有课程信息（用于查询评价）
  const fetchAllCourses = useCallback(async (): Promise<CourseDisplayInfo[]> => {
    try {
      // 生成完整的时间表（所有天 × 所有时间段）
      const allTimeSlots: CourseTime[] = [];
      const allDays = Object.values(DayOfWeek);
      const allTimePeriods = Object.values(TimePeriod);
      
      for (const day of allDays) {
        for (const period of allTimePeriods) {
          allTimeSlots.push(new CourseTime(day, period));
        }
      }
      
      console.log('生成的完整时间表:', allTimeSlots.length, '个时间段');
      console.log('时间表示例:', allTimeSlots.slice(0, 3));
      
      // 使用QueryCoursesByFilterMessage获取所有课程，传入完整时间表
      const message = new QueryCoursesByFilterMessage(
        userToken,
        null, // courseGroupID
        null, // courseGroupName  
        null, // teacherName
        allTimeSlots // 传入完整时间表，表示所有时间都可用
      );
      
      console.log('发送查询所有课程请求:', message);
      
      const response = await sendMessage(message, 10000);
      
      if (!response.ok) {
        console.error('API响应失败:', response.status, response.statusText);
        throw new Error('获取所有课程失败');
      }
      
      const pairs: PairOfGroupAndCourse[] = await response.json();
      console.log('API返回的原始课程数据:', pairs);
      console.log('返回的课程数量:', pairs.length);
      
      // 获取所有教师ID，用于批量查询教师信息
      const teacherIDs = [...new Set(pairs.map(pair => pair.Course.teacherID))];
      console.log('需要查询的教师IDs:', teacherIDs);
      
      // 批量获取教师信息
      const teachersMessage = new QuerySafeUserInfoByUserIDListMessage(teacherIDs);
      const teachersResponse = await sendMessage(teachersMessage, 10000);
      const teachers = new Map<number, SafeUserInfo>();
      
      if (teachersResponse.ok) {
        const teacherInfos: SafeUserInfo[] = await teachersResponse.json();
        console.log('获取到的教师信息:', teacherInfos);
        teacherInfos.forEach(teacher => {
          teachers.set(teacher.userID, teacher);
        });
      } else {
        console.error('获取教师信息失败:', teachersResponse.status);
      }
      
      // 组装显示用的课程信息
      const displayCourses: CourseDisplayInfo[] = pairs.map(pair => ({
        courseID: pair.Course.courseID,
        courseName: pair.CourseGroup.name,
        teacherName: teachers.get(pair.Course.teacherID)?.userName || '未知教师',
        semester: new Date().getFullYear() + '年度',
        courseGroupID: pair.CourseGroup.courseGroupID
      }));
      
      console.log('最终组装的课程显示信息:', displayCourses);
      console.log('最终课程数量:', displayCourses.length);
      
      return displayCourses;
    } catch (error) {
      console.error('获取所有课程信息失败:', error);
      throw error;
    }
  }, [userToken]);

  const fetchEligibleCourses = useCallback(async (): Promise<CourseDisplayInfo[]> => {
    try {
      // 获取学生已选课程
      const selectedCoursesMessage = new QueryStudentSelectedCoursesMessage(userToken);
      const selectedCoursesResponse = await sendMessage(selectedCoursesMessage, 10000);
      
      if (!selectedCoursesResponse.ok) {
        throw new Error('获取已选课程失败');
      }
      
      const courseInfos: CourseInfo[] = await selectedCoursesResponse.json();
      
      // 获取课程组信息和教师信息
      const courseGroupIDs = [...new Set(courseInfos.map(course => course.courseGroupID))];
      const teacherIDs = [...new Set(courseInfos.map(course => course.teacherID))];
      
      // 批量获取课程组信息
      const courseGroupPromises = courseGroupIDs.map(async (groupID) => {
        const message = new QueryCourseGroupByIDMessage(userToken, groupID);
        const response = await sendMessage(message, 10000);
        if (response.ok) {
          const courseGroup: CourseGroup = await response.json();
          return { id: groupID, group: courseGroup };
        }
        return null;
      });
      
      const courseGroupResults = await Promise.all(courseGroupPromises);
      const courseGroups = new Map<number, CourseGroup>();
      courseGroupResults.forEach(result => {
        if (result) {
          courseGroups.set(result.id, result.group);
        }
      });
      
      // 批量获取教师信息
      const teachersMessage = new QuerySafeUserInfoByUserIDListMessage(teacherIDs);
      const teachersResponse = await sendMessage(teachersMessage, 10000);
      const teachers = new Map<number, SafeUserInfo>();
      
      if (teachersResponse.ok) {
        const teacherInfos: SafeUserInfo[] = await teachersResponse.json();
        teacherInfos.forEach(teacher => {
          teachers.set(teacher.userID, teacher);
        });
      }
      
      // 组装显示用的课程信息
      const displayCourses: CourseDisplayInfo[] = courseInfos.map(course => ({
        courseID: course.courseID,
        courseName: courseGroups.get(course.courseGroupID)?.name || '未知课程',
        teacherName: teachers.get(course.teacherID)?.userName || '未知教师',
        semester: new Date().getFullYear() + '年度',
        courseGroupID: course.courseGroupID
      }));
      
      return displayCourses;
    } catch (error) {
      console.error('获取课程信息失败:', error);
      throw error;
    }
  }, [userToken]);

  const fetchExistingEvaluations = useCallback(async (courses: CourseDisplayInfo[]): Promise<CourseEvaluationData[]> => {
    try {
      // 为每门课程查询评价
      const evaluationPromises = courses.map(async (course) => {
        const message = new QueryCourseEvaluationsMessage(userToken, course.courseID);
        const response = await sendMessage(message, 10000);
        
        if (response.ok) {
          const evaluations: CourseEvaluation[] = await response.json();
          
          // 获取当前用户信息
          const userInfoMessage = new QuerySafeUserInfoByTokenMessage(userToken);
          const userInfoResponse = await sendMessage(userInfoMessage, 10000);
          
          if (userInfoResponse.ok) {
            const userInfo: SafeUserInfo = await userInfoResponse.json();
            
            // 找到当前用户的评价
            const userEvaluation = evaluations.find(evaluation => evaluation.evaluatorID === userInfo.userID);
            
            if (userEvaluation) {
              return {
                courseID: course.courseID,
                rating: parseInt(userEvaluation.rating),
                feedback: userEvaluation.feedback || '',
                lastUpdated: new Date() // 这里需要从API获取更新时间
              };
            }
          }
        }
        return null;
      });
      
      const results = await Promise.all(evaluationPromises);
      return results.filter(result => result !== null) as CourseEvaluationData[];
    } catch (error) {
      console.error('获取现有评价失败:', error);
      throw error;
    }
  }, [userToken]);

  // 获取特定课程的所有评价
  const fetchCourseEvaluations = useCallback(async (courseID: number): Promise<PublicEvaluationInfo[]> => {
    try {
      if (!userToken) {
        console.error('获取课程评价失败: userToken不存在');
        throw new Error('未授权，请先登录');
      }
      
      // 添加详细的 token 日志，但不打印完整 token（安全考虑）
      const tokenPrefix = userToken.substring(0, 8);
      const tokenLength = userToken.length;
      console.log(`获取课程评价，courseID: ${courseID}, token前缀: ${tokenPrefix}..., token长度: ${tokenLength}`);
      
      // 检查 token 格式是否正确
      if (userToken.trim() === '' || tokenLength < 10) {
        console.error('获取课程评价失败: userToken格式无效');
        throw new Error('用户凭证无效，请重新登录');
      }
      
      console.time('QueryCourseEvaluationsMessage');
      const message = new QueryCourseEvaluationsMessage(userToken, courseID);
      const response = await sendMessage(message, 10000);
      console.timeEnd('QueryCourseEvaluationsMessage');
      
      console.log('API 响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('API响应失败:', response.status, response.statusText);
        const errorText = await response.text().catch(() => '无法读取错误详情');
        console.error('API错误详情:', errorText);
        throw new Error(`获取课程评价失败 (${response.status}): ${errorText || response.statusText}`);
      }
      
      const evaluations: CourseEvaluation[] = await response.json();
      console.log(`获取到 ${evaluations.length} 条课程评价`);
      
      // 获取评价者信息
      const evaluatorIDs = [...new Set(evaluations.map(e => e.evaluatorID))];
      console.log(`需要获取 ${evaluatorIDs.length} 个评价者信息`);
      
      const evaluatorsMessage = new QuerySafeUserInfoByUserIDListMessage(evaluatorIDs);
      const evaluatorsResponse = await sendMessage(evaluatorsMessage, 10000);
      
      const evaluators = new Map<number, SafeUserInfo>();
      if (evaluatorsResponse.ok) {
        const evaluatorInfos: SafeUserInfo[] = await evaluatorsResponse.json();
        console.log(`成功获取到 ${evaluatorInfos.length} 个评价者信息`);
        evaluatorInfos.forEach(evaluator => {
          evaluators.set(evaluator.userID, evaluator);
        });
      } else {
        console.error('获取评价者信息失败:', evaluatorsResponse.status);
      }
      
      // 组装公开评价信息
      const publicEvaluations: PublicEvaluationInfo[] = evaluations.map(evaluation => ({
        evaluatorName: evaluators.get(evaluation.evaluatorID)?.userName || '匿名用户',
        rating: parseInt(evaluation.rating),
        feedback: evaluation.feedback || '',
        evaluatedAt: new Date() // 实际应该从API获取评价时间
      }));
      
      console.log(`组装了 ${publicEvaluations.length} 条公开评价信息`);
      return publicEvaluations;
    } catch (error) {
      console.error('获取课程评价失败:', error);
      throw error;
    }
  }, [userToken]);

  // 加载数据
  useEffect(() => {
    if (!canEvaluate) {
      console.log('没有评价权限，跳过数据加载');
      return;
    }
    
    if (!userToken) {
      console.log('无有效的 userToken，跳过数据加载');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      console.log('开始加载课程评价页面数据...');
      try {
        console.log('使用 token:', userToken.substring(0, 8) + '..., 长度:' + userToken.length);
        
        // 先加载用户已选课程
        console.log('1. 加载用户已选课程');
        const courses = await fetchEligibleCourses();
        console.log(`已加载 ${courses.length} 门已选课程`);
        
        // 然后加载用户已有评价
        console.log('2. 加载用户已有评价');
        const evaluations = await fetchExistingEvaluations(courses);
        console.log(`已加载 ${evaluations.length} 条已有评价`);
        
        // 最后加载所有课程
        console.log('3. 加载所有课程');
        const allCoursesData = await fetchAllCourses();
        console.log(`已加载 ${allCoursesData.length} 门所有课程`);
        
        console.log('数据加载完成:', {
          eligibleCourses: courses.length,
          existingEvaluations: evaluations.length, 
          allCourses: allCoursesData.length
        });
        
        setEligibleCourses(courses);
        setExistingEvaluations(evaluations);
        setAllCourses(allCoursesData);
        setFilteredCourses(allCoursesData);
      } catch (error) {
        console.error('加载数据失败:', error);
        message.error('加载数据失败: ' + (error instanceof Error ? error.message : '未知错误'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [canEvaluate, userToken, fetchEligibleCourses, fetchExistingEvaluations, fetchAllCourses]);

  // 搜索课程
  const handleCourseSearch = useCallback((searchCriteria: CourseSearchCriteria) => {
    console.log('执行课程搜索，搜索条件:', searchCriteria);
    console.log('当前所有课程数量:', allCourses.length);
    
    setSearchLoading(true);
    
    // 使用requestAnimationFrame来避免ResizeObserver错误
    requestAnimationFrame(() => {
      setTimeout(() => {
        let filtered = allCourses;
        
        if (searchCriteria.courseName) {
          console.log('按课程名过滤:', searchCriteria.courseName);
          filtered = filtered.filter(course => 
            course.courseName.toLowerCase().includes(searchCriteria.courseName!.toLowerCase())
          );
          console.log('按课程名过滤后数量:', filtered.length);
        }
        
        if (searchCriteria.teacherName) {
          console.log('按教师名过滤:', searchCriteria.teacherName);
          filtered = filtered.filter(course => 
            course.teacherName.toLowerCase().includes(searchCriteria.teacherName!.toLowerCase())
          );
          console.log('按教师名过滤后数量:', filtered.length);
        }
        
        console.log('最终搜索结果:', { 
          searchCriteria, 
          totalCourses: allCourses.length, 
          filteredCount: filtered.length,
          filtered: filtered.slice(0, 5) // 打印前5个用于调试
        });
        
        setFilteredCourses(filtered);
        // 延迟设置loading状态，确保DOM更新完成
        setTimeout(() => setSearchLoading(false), 100);
      }, 200);
    });
  }, [allCourses]);

  // 重置搜索
  const resetSearch = useCallback(() => {
    console.log('重置搜索，显示所有课程');
    setFilteredCourses(allCourses);
  }, [allCourses]);

  // 查看课程评价
  const handleViewCourseEvaluations = useCallback(async (courseID: number) => {
    if (!userToken) {
      message.error('用户未授权，无法获取评价');
      return;
    }
    
    setSelectedCourseForView(courseID);
    setEvaluationsLoading(true);
    console.log('查看课程评价, courseID:', courseID, 'userToken存在:', !!userToken);
    
    try {
      const evaluations = await fetchCourseEvaluations(courseID);
      setCourseEvaluations(evaluations);
    } catch (error) {
      message.error('获取课程评价失败');
      setCourseEvaluations([]);
    } finally {
      setEvaluationsLoading(false);
    }
  }, [fetchCourseEvaluations, userToken]);

  // 获取课程的现有评价
  const getExistingEvaluation = useCallback((courseID: number): CourseEvaluationData | undefined => {
    return existingEvaluations.find(evaluation => evaluation.courseID === courseID);
  }, [existingEvaluations]);

  return {
    eligibleCourses,
    allCourses,
    filteredCourses,
    existingEvaluations,
    courseEvaluations,
    loading,
    searchLoading,
    evaluationsLoading,
    selectedCourseForView,
    handleCourseSearch,
    handleViewCourseEvaluations,
    resetSearch,
    getExistingEvaluation
  };
};
