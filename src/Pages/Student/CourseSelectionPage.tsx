// CourseSelectionPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  message, 
  Typography, 
  Tabs,
  Spin,
  Tag,
  Space,
  Form
} from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import WithRoleBasedSidebarLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { useUserToken } from 'Globals/GlobalStore';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { QuerySafeUserInfoByUserIDMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDMessage';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';

// 学期阶段相关
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';

// 课程管理相关
import { QueryCoursesByFilterMessage } from 'Plugins/CourseManagementService/APIs/QueryCoursesByFilterMessage';
import { PairOfGroupAndCourse } from 'Plugins/CourseManagementService/Objects/PairOfGroupAndCourse';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';

// 选课相关
import { SelectCourseMessage } from 'Plugins/CourseSelectionService/APIs/SelectCourseMessage';
import { PreselectCourseMessage } from 'Plugins/CourseSelectionService/APIs/PreselectCourseMessage';
import { DropCourseMessage } from 'Plugins/CourseSelectionService/APIs/DropCourseMessage';
import { QueryStudentSelectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentSelectedCoursesMessage';
import { QueryStudentPreselectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentPreselectedCoursesMessage';
import { QueryStudentWaitingListStatusMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentWaitingListStatusMessage';
import { PairOfCourseAndRank } from 'Plugins/CourseSelectionService/Objects/PairOfCourseAndRank';

// 组件导入
import { CourseSearchForm, CourseList, MyCoursesTabs } from './Components';

const { Title, Text } = Typography;

// 课程显示数据接口
interface CourseDisplayData {
  courseID: number;
  courseName: string;
  teacher: string;
  schedule: string;
  location: string;
  currentStudents: number;
  capacity: number;
  credit: number;
  introduction?: string;
  courseGroupID: number;
  isConflicted: boolean;
}

// 辅助函数：将CourseTime数组转换为可读字符串
const formatCourseTime = (timeArray: CourseTime[]): string => {
  if (!timeArray || timeArray.length === 0) return '时间待定';
  
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
  
  return timeArray.map(time => 
    `${dayNames[time.dayOfWeek] || time.dayOfWeek} ${timeNames[time.timePeriod] || time.timePeriod}`
  ).join('\n');
};

export const courseSelectionPagePath = '/student/course-selection';

export const CourseSelectionPage: React.FC = () => {
  const userToken = useUserToken();
  const [form] = Form.useForm();
  
  // 状态管理
  const [userInfo, setUserInfo] = useState<SafeUserInfo | null>(null);
  const [semesterPhase, setSemesterPhase] = useState<SemesterPhase | null>(null);
  const [allCourses, setAllCourses] = useState<CourseDisplayData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseDisplayData[]>([]);
  const [mySelectedCourses, setMySelectedCourses] = useState<CourseDisplayData[]>([]);
  const [myPreselectedCourses, setMyPreselectedCourses] = useState<CourseDisplayData[]>([]);
  const [myWaitingList, setMyWaitingList] = useState<PairOfCourseAndRank[]>([]);
  const [myWaitingListWithTeacherNames, setMyWaitingListWithTeacherNames] = useState<CourseDisplayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [teacherInfoCache, setTeacherInfoCache] = useState<{ [key: number]: string }>({});

  // 查询教师信息的函数
  const getTeacherName = async (teacherID: number): Promise<string> => {
    // 检查缓存
    if (teacherInfoCache[teacherID]) {
      return teacherInfoCache[teacherID];
    }

    return new Promise((resolve) => {
      new QuerySafeUserInfoByUserIDMessage(teacherID).send(
        (response: string) => {
          try {
            const teacherInfo: SafeUserInfo = JSON.parse(response);
            const teacherName = teacherInfo.userName || `教师${teacherID}`;
            
            // 更新缓存
            setTeacherInfoCache(prev => ({
              ...prev,
              [teacherID]: teacherName
            }));
            
            resolve(teacherName);
          } catch (e) {
            resolve(`教师${teacherID}`);
          }
        },
        () => {
          resolve(`教师${teacherID}`);
        }
      );
    });
  };

  // API数据转换函数
  const transformToCourse = async (pair: PairOfGroupAndCourse): Promise<CourseDisplayData> => {
    const courseGroup = pair.CourseGroup;
    const courseInfo = pair.Course;
    
    const teacherName = await getTeacherName(courseInfo.teacherID);
    
    return {
      courseID: courseInfo.courseID,
      courseGroupID: courseGroup.courseGroupID,
      courseName: courseGroup.name,
      teacher: teacherName,
      schedule: formatCourseTime(courseInfo.time),
      location: courseInfo.location || '待定',
      currentStudents: courseInfo.selectedStudentsSize || 0,
      capacity: courseInfo.courseCapacity || 0,
      credit: courseGroup.credit || 0,
      introduction: undefined,
      isConflicted: false
    };
  };

  const convertCourseInfoToDisplayData = async (courseInfo: CourseInfo): Promise<CourseDisplayData> => {
    const teacherName = await getTeacherName(courseInfo.teacherID);
    
    return {
      courseID: courseInfo.courseID,
      courseGroupID: courseInfo.courseGroupID,
      courseName: `课程${courseInfo.courseID}`,
      teacher: teacherName,
      schedule: formatCourseTime(courseInfo.time),
      location: courseInfo.location || '待定',
      currentStudents: courseInfo.selectedStudentsSize || 0,
      capacity: courseInfo.courseCapacity || 0,
      credit: 0,
      introduction: undefined,
      isConflicted: false
    };
  };

  // 页面初始化
  useEffect(() => {
    if (!userToken) return;
    
    setLoading(true);
    new QuerySafeUserInfoByTokenMessage(userToken).send(
      (info: string) => {
        try {
          const raw = JSON.parse(info);
          const safeUser = new SafeUserInfo(raw.userID, raw.userName, raw.accountName, raw.role);
          setUserInfo(safeUser);
          
          // 加载学期阶段
          new QuerySemesterPhaseStatusMessage(userToken).send(
            (phaseInfo: string) => {
              try {
                const phase: SemesterPhase = JSON.parse(phaseInfo);
                setSemesterPhase(phase);
                
                // 加载所有课程
                loadAllCourses();
                
                // 加载我的课程
                loadMyCourses();
              } catch (e) {
                message.error('解析学期阶段失败');
              }
              setLoading(false);
            },
            () => {
              message.error('获取学期阶段失败');
              setLoading(false);
            }
          );
        } catch (e) {
          message.error('解析用户信息失败');
          setLoading(false);
        }
      },
      () => {
        message.error('获取用户信息失败');
        setLoading(false);
      }
    );
  }, [userToken]);

  const loadAllCourses = async (filters: any = {}) => {
    new QueryCoursesByFilterMessage(
      userToken,
      filters.courseGroupID ? parseInt(filters.courseGroupID) : null,
      filters.courseName || null,
      filters.teacher || null,
      []
    ).send(
      async (response: string) => {
        try {
          const apiData: PairOfGroupAndCourse[] = JSON.parse(response);
          const coursePromises = apiData.map(transformToCourse);
          const courses = await Promise.all(coursePromises);
          setAllCourses(courses);
          setFilteredCourses(courses);
        } catch (e) {
          console.error('Failed to load courses:', e);
        }
      },
      (error: string) => console.error('Failed to load courses:', error)
    );
  };

  const loadMyCourses = () => {
    // 加载已选课程
    new QueryStudentSelectedCoursesMessage(userToken).send(
      async (response: string) => {
        try {
          const courses: CourseInfo[] = JSON.parse(response);
          const coursePromises = courses.map(convertCourseInfoToDisplayData);
          const coursesWithTeacherNames = await Promise.all(coursePromises);
          setMySelectedCourses(coursesWithTeacherNames);
        } catch (e) {
          setMySelectedCourses([]);
        }
      },
      () => setMySelectedCourses([])
    );

    // 加载预选课程
    new QueryStudentPreselectedCoursesMessage(userToken).send(
      async (response: string) => {
        try {
          const courses: CourseInfo[] = JSON.parse(response);
          const coursePromises = courses.map(convertCourseInfoToDisplayData);
          const coursesWithTeacherNames = await Promise.all(coursePromises);
          setMyPreselectedCourses(coursesWithTeacherNames);
        } catch (e) {
          setMyPreselectedCourses([]);
        }
      },
      () => setMyPreselectedCourses([])
    );

    // 加载等待列表
    new QueryStudentWaitingListStatusMessage(userToken).send(
      async (response: string) => {
        try {
          const waitingList: PairOfCourseAndRank[] = JSON.parse(response);
          setMyWaitingList(waitingList);
          
          // 转换等待列表为显示数据
          const waitingCoursesPromises = waitingList.map(item => convertCourseInfoToDisplayData(item.course));
          const waitingCoursesWithTeacherNames = await Promise.all(waitingCoursesPromises);
          setMyWaitingListWithTeacherNames(waitingCoursesWithTeacherNames);
        } catch (e) {
          setMyWaitingList([]);
          setMyWaitingListWithTeacherNames([]);
        }
      },
      () => {
        setMyWaitingList([]);
        setMyWaitingListWithTeacherNames([]);
      }
    );
  };

  const handleSearch = (values: any) => {
    setSearching(true);
    loadAllCourses(values);
    setSearching(false);
  };

  const handleSelectCourse = async (course: CourseDisplayData) => {
    if (!semesterPhase) {
      message.error('学期阶段信息未加载');
      return;
    }

    if (semesterPhase.currentPhase === Phase.phase1) {
      // 预选阶段：调用预选API
      new PreselectCourseMessage(userToken, course.courseID).send(
        (response: string) => {
          message.success('预选成功');
          loadMyCourses();
          loadAllCourses();
        },
        (error: string) => {
          message.error('预选失败: ' + error);
        }
      );
    } else if (semesterPhase.currentPhase === Phase.phase2) {
      // 正选阶段：调用选课API
      new SelectCourseMessage(userToken, course.courseID).send(
        (response: string) => {
          message.success('选课成功');
          loadMyCourses();
          loadAllCourses();
        },
        (error: string) => {
          message.error('选课失败: ' + error);
        }
      );
    } else {
      message.error('当前不在选课阶段');
    }
  };

  const handlePreselectCourse = async (course: CourseDisplayData) => {
    new PreselectCourseMessage(userToken, course.courseID).send(
      (response: string) => {
        message.success('预选成功');
        loadMyCourses();
        loadAllCourses();
      },
      (error: string) => {
        message.error('预选失败: ' + error);
      }
    );
  };

  const handleDropCourse = (course: CourseDisplayData) => {
    new DropCourseMessage(userToken, course.courseID).send(
      (response: string) => {
        message.success('退课成功');
        loadMyCourses();
        loadAllCourses();
      },
      (error: string) => {
        message.error('退课失败: ' + error);
      }
    );
  };

  // 权限检查
  if (!userToken) {
    return (
      <WithRoleBasedSidebarLayout role={UserRole.student}>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Text>请先登录</Text>
        </div>
      </WithRoleBasedSidebarLayout>
    );
  }

  // 获取权限状态
  const canSelectCourse = semesterPhase?.currentPhase === Phase.phase2;
  const canPreselectCourse = semesterPhase?.currentPhase === Phase.phase1;

  return (
    <WithRoleBasedSidebarLayout role={UserRole.student}>
      <div style={{ 
        padding: '24px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* 页面标题和阶段信息 */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ color: '#d81b60', marginBottom: '8px' }}>
              课程选择中心 - 欢迎 {userInfo?.userName || '用户'}
            </Title>
            {semesterPhase && (
              <div>
                <Tag 
                  color={semesterPhase.currentPhase === Phase.phase1 ? 'blue' : 'green'} 
                  style={{ fontSize: '14px', padding: '4px 12px' }}
                >
                  当前阶段: {semesterPhase.currentPhase === Phase.phase1 ? '预选阶段' : '正选阶段'}
                </Tag>
                <Text type="secondary" style={{ marginLeft: 16 }}>
                  {semesterPhase.permissions.allowStudentSelect ? '可以选课' : '不可选课'} | 
                  {semesterPhase.permissions.allowStudentDrop ? '可以退课' : '不可退课'}
                </Text>
              </div>
            )}
          </div>

          {/* 主要内容区域 */}
          <Spin spinning={loading}>
            <Tabs
              defaultActiveKey="all"
              centered
              size="large"
              items={[
                {
                  key: 'all',
                  label: (
                    <Space>
                      <TeamOutlined />
                      <span>所有课程</span>
                      <Tag color="blue">{filteredCourses.length}</Tag>
                    </Space>
                  ),
                  children: (
                    <>
                      <CourseSearchForm
                        form={form}
                        onSearch={handleSearch}
                        searching={searching}
                      />
                      <CourseList
                        courses={filteredCourses}
                        loading={false}
                        canSelectCourse={canSelectCourse}
                        canPreselectCourse={canPreselectCourse}
                        selectedCourses={mySelectedCourses}
                        preselectedCourses={myPreselectedCourses}
                        waitingListCourses={myWaitingList}
                        onSelectCourse={handleSelectCourse}
                        onPreselectCourse={handlePreselectCourse}
                        onDropCourse={handleDropCourse}
                      />
                    </>
                  )
                },
                {
                  key: 'mycourses',
                  label: (
                    <Space>
                      <span>我的课程</span>
                      <Tag color="green">{mySelectedCourses.length + myPreselectedCourses.length}</Tag>
                    </Space>
                  ),
                  children: (
                    <MyCoursesTabs
                      selectedCourses={mySelectedCourses}
                      preselectedCourses={myPreselectedCourses}
                      waitingListCourses={myWaitingListWithTeacherNames}
                      onDropCourse={handleDropCourse}
                    />
                  )
                }
              ]}
            />
          </Spin>
        </div>
      </div>
    </WithRoleBasedSidebarLayout>
  );
};

export default CourseSelectionPage;