// useCourseData.ts - 课程数据加载逻辑的自定义hook
import { useState, useEffect, useCallback } from 'react';
import { QueryCoursesByFilterMessage } from 'Plugins/CourseManagementService/APIs/QueryCoursesByFilterMessage';
import { QueryStudentSelectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentSelectedCoursesMessage';
import { QueryStudentPreselectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentPreselectedCoursesMessage';
import { QueryStudentWaitingListStatusMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentWaitingListStatusMessage';
import { PairOfGroupAndCourse } from 'Plugins/CourseManagementService/Objects/PairOfGroupAndCourse';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { PairOfCourseAndRank } from 'Plugins/CourseSelectionService/Objects/PairOfCourseAndRank';
import { CourseDisplayData } from './useCourseActions';
import { courseUtils } from '../utils/courseUtils';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';

export interface UseCourseDataResult {
  courses: CourseDisplayData[];
  selectedCourses: CourseDisplayData[];
  preselectedCourses: CourseDisplayData[];
  waitingList: Array<CourseDisplayData & { rank: number }>;
  loading: boolean;
  error: string | null;
  fetchCourses: (filter?: { courseName?: string; courseID?: string; teacherID?: string }) => void;
  refreshData: () => void;
}

export const useCourseData = (userToken: string, semesterPhase: SemesterPhase | null): UseCourseDataResult => {
  const [courses, setCourses] = useState<CourseDisplayData[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<CourseDisplayData[]>([]);
  const [preselectedCourses, setPreselectedCourses] = useState<CourseDisplayData[]>([]);
  const [waitingList, setWaitingList] = useState<Array<CourseDisplayData & { rank: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformCoursesToDisplayData = useCallback(async (
    courseData: CourseInfo[],
    selectedCourseIds: number[] = [],
    preselectedCourseIds: number[] = []
  ): Promise<CourseDisplayData[]> => {
    return await courseUtils.transformCoursesToDisplayData(
      courseData,
      userToken,
      selectedCourseIds,
      preselectedCourseIds
    );
  }, [userToken]);

  const transformPairsToDisplayData = useCallback(async (
    pairs: PairOfGroupAndCourse[],
    selectedCourseIds: number[] = [],
    preselectedCourseIds: number[] = []
  ): Promise<CourseDisplayData[]> => {
    return await courseUtils.transformPairsToDisplayData(
      pairs,
      selectedCourseIds,
      preselectedCourseIds
    );
  }, []);

  const fetchCourses = useCallback((filter?: { courseName?: string; courseID?: string; teacherID?: string }) => {
    console.log('fetchCourses 被调用，过滤参数：', filter);
    setLoading(true);
    setError(null);

    // 构造查询参数
    const courseGroupID = filter?.courseID ? parseInt(filter.courseID) : null;
    const courseGroupName = filter?.courseName || null;
    const teacherName = filter?.teacherID || null;
    const allowedTimePeriods: CourseTime[] = []; // 空数组表示不按时间过滤

    console.log('发送查询请求，参数：', {
      courseGroupID,
      courseGroupName,
      teacherName,
      allowedTimePeriods
    });

    new QueryCoursesByFilterMessage(
      userToken,
      courseGroupID,
      courseGroupName,
      teacherName,
      allowedTimePeriods
    ).send(
      async (response: string) => {
        try {
          console.log('收到课程数据响应：', response);
          const apiData: PairOfGroupAndCourse[] = JSON.parse(response);
          console.log('解析后的课程数据：', apiData);
          const displayCourses = await transformPairsToDisplayData(apiData);
          console.log('转换后的显示数据：', displayCourses);
          setCourses(displayCourses);
        } catch (err) {
          console.error('课程数据转换失败：', err);
          setError('课程数据转换失败');
        } finally {
          setLoading(false);
        }
      },
      (error: string) => {
        console.error('获取课程数据失败：', error);
        setError('获取课程数据失败: ' + error);
        setLoading(false);
      }
    );
  }, [userToken, transformPairsToDisplayData]);

  const fetchSelectedCourses = useCallback(() => {
    new QueryStudentSelectedCoursesMessage(userToken).send(
      async (response: string) => {
        try {
          const courses: CourseInfo[] = JSON.parse(response);
          const displayCourses = await transformCoursesToDisplayData(courses);
          setSelectedCourses(displayCourses);
        } catch (err) {
          console.error('Error transforming selected courses:', err);
          setSelectedCourses([]);
        }
      },
      (error: string) => {
        console.error('获取已选课程失败:', error);
        setSelectedCourses([]);
      }
    );
  }, [userToken, transformCoursesToDisplayData]);

  const fetchPreselectedCourses = useCallback(() => {
    new QueryStudentPreselectedCoursesMessage(userToken).send(
      async (response: string) => {
        try {
          const courses: CourseInfo[] = JSON.parse(response);
          const displayCourses = await transformCoursesToDisplayData(courses);
          setPreselectedCourses(displayCourses);
        } catch (err) {
          console.error('Error transforming preselected courses:', err);
          setPreselectedCourses([]);
        }
      },
      (error: string) => {
        console.error('获取预选课程失败:', error);
        setPreselectedCourses([]);
      }
    );
  }, [userToken, transformCoursesToDisplayData]);

  const fetchWaitingList = useCallback(() => {
    new QueryStudentWaitingListStatusMessage(userToken).send(
      async (response: string) => {
        try {
          const waitingListData: PairOfCourseAndRank[] = JSON.parse(response);
          const waitingCourses = waitingListData.map(async (pair) => {
            const displayData = await courseUtils.convertCourseToDisplayData(pair.course, userToken);
            return {
              ...displayData,
              rank: pair.rank
            };
          });
          const resolvedWaitingCourses = await Promise.all(waitingCourses);
          setWaitingList(resolvedWaitingCourses);
        } catch (err) {
          console.error('Error transforming waiting list:', err);
          setWaitingList([]);
        }
      },
      (error: string) => {
        console.error('获取等待列表失败:', error);
        setWaitingList([]);
      }
    );
  }, [userToken]);

  const refreshData = useCallback(() => {
    if (!userToken || !semesterPhase) return;
    
    const isPhase1 = semesterPhase.currentPhase === Phase.phase1;
    const isPhase2 = semesterPhase.currentPhase === Phase.phase2;
    
    console.log('根据学期阶段刷新数据：', {
      currentPhase: semesterPhase.currentPhase,
      isPhase1,
      isPhase2
    });
    
    if (isPhase1) {
      // 阶段1（预选阶段）：只获取预选课程，不获取已选课程和等待列表
      fetchPreselectedCourses();
      setSelectedCourses([]); // 清空已选课程
      setWaitingList([]); // 清空等待列表
    } else if (isPhase2) {
      // 阶段2（正选阶段）：只获取已选课程和等待列表，不获取预选课程
      fetchSelectedCourses();
      fetchWaitingList();
      setPreselectedCourses([]); // 清空预选课程
    } else {
      // 其他阶段或未知阶段：获取所有数据
      fetchSelectedCourses();
      fetchPreselectedCourses();
      fetchWaitingList();
    }
  }, [userToken, semesterPhase, fetchSelectedCourses, fetchPreselectedCourses, fetchWaitingList]);

  // 初始加载我的课程数据和所有课程
  useEffect(() => {
    if (userToken && semesterPhase) {
      console.log('自动加载数据，用户Token：', userToken);
      console.log('当前学期阶段：', semesterPhase.currentPhase);
      
      const isPhase1 = semesterPhase.currentPhase === Phase.phase1;
      const isPhase2 = semesterPhase.currentPhase === Phase.phase2;
      
      // 根据阶段加载对应的课程数据
      if (isPhase1) {
        // 阶段1：只加载预选课程
        console.log('阶段1 - 加载预选课程');
        fetchPreselectedCourses();
      } else if (isPhase2) {
        // 阶段2：加载已选课程和等待列表
        console.log('阶段2 - 加载已选课程和等待列表');
        fetchSelectedCourses();
        fetchWaitingList();
      }
      
      // 自动加载所有课程（无过滤条件）
      console.log('自动加载所有课程...');
      fetchCourses();
    }
  }, [userToken, semesterPhase, fetchSelectedCourses, fetchPreselectedCourses, fetchWaitingList, fetchCourses]);

  return {
    courses,
    selectedCourses,
    preselectedCourses,
    waitingList,
    loading,
    error,
    fetchCourses,
    refreshData
  };
};
