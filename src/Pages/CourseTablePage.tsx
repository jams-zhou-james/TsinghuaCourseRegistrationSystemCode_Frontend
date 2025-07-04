import React, { useEffect, useState } from 'react';
import './CourseTablePage.css';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import WithRoleBasedSidebarLayout from '../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout from '../Layouts/BackgroundLayout';
import { Table, Card, Tag, Spin, message } from 'antd';
import { useUserToken } from 'Globals/GlobalStore';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';
import { QueryOwnCoursesMessage } from 'Plugins/CourseManagementService/APIs/QueryOwnCoursesMessage';
import { QueryStudentPreselectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentPreselectedCoursesMessage';
import { QueryStudentSelectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentSelectedCoursesMessage';
import { QueryStudentWaitingListStatusMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentWaitingListStatusMessage';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { DayOfWeek } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod } from 'Plugins/CourseManagementService/Objects/TimePeriod';
import { PairOfCourseAndRank } from 'Plugins/CourseSelectionService/Objects/PairOfCourseAndRank';
import { QueryCourseGroupByIDMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupByIDMessage';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';

// 定义课程状态枚举
enum CourseStatus {
  SELECTED = 'selected',    // 已选中
  WAITING = 'waiting',      // 候补名单
  PRESELECTED = 'preselected' // 预选（仅阶段1）
}

// 定义课程类型
interface Course {
  id: string;
  name: string;       // 课程名称
  teacher: string;    // 教师姓名
  location: string;   // 上课地点
  dayOfWeek: number;  // 星期几 (1-7, 1表示星期一)
  startTime: string;  // 开始时间 (如 "08:00")
  endTime: string;    // 结束时间 (如 "09:35")
  status?: CourseStatus; // 课程状态（学生用）
  waitingRank?: number;   // 候补排名（如果是候补状态）
}

// 时间段映射
const TIME_PERIOD_MAP = {
  [TimePeriod.morning]: { startTime: '08:00', endTime: '09:35' },
  [TimePeriod.lateMorning]: { startTime: '09:50', endTime: '12:15' },
  [TimePeriod.earlyAfternoon]: { startTime: '13:30', endTime: '15:05' },
  [TimePeriod.midAfternoon]: { startTime: '15:20', endTime: '16:55' },
  [TimePeriod.lateAfternoon]: { startTime: '17:05', endTime: '18:40' },
  [TimePeriod.evening]: { startTime: '19:20', endTime: '21:45' }
};

// 星期映射
const DAY_OF_WEEK_MAP = {
  [DayOfWeek.monday]: 1,
  [DayOfWeek.tuesday]: 2,
  [DayOfWeek.wednesday]: 3,
  [DayOfWeek.thursday]: 4,
  [DayOfWeek.friday]: 5,
  [DayOfWeek.saturday]: 6,
  [DayOfWeek.sunday]: 7
};

// 将CourseInfo转换为Course格式的辅助函数
const convertCourseInfoToCourse = async (
  courseInfo: CourseInfo, 
  userToken: string, 
  status?: CourseStatus, 
  waitingRank?: number
): Promise<Course[]> => {
  const courses: Course[] = [];
  
  // 获取课程组信息来获得课程名称
  const courseGroup = await new Promise<CourseGroup | null>((resolve) => {
    new QueryCourseGroupByIDMessage(userToken, courseInfo.courseGroupID).send(
      (info: string) => {
        try {
          const data = JSON.parse(info);
          resolve(new CourseGroup(data.courseGroupID, data.name, data.credit, data.ownerTeacherID, data.authorizedTeachers));
        } catch (e) {
          console.error('解析课程组失败:', e);
          resolve(null);
        }
      },
      () => {
        console.error('获取课程组失败');
        resolve(null);
      }
    );
  });

  // 处理每个上课时间
  courseInfo.time.forEach((courseTime: CourseTime) => {
    const dayOfWeek = DAY_OF_WEEK_MAP[courseTime.dayOfWeek];
    const timeInfo = TIME_PERIOD_MAP[courseTime.timePeriod];
    
    if (dayOfWeek && timeInfo) {
      courses.push({
        id: `${courseInfo.courseID}-${dayOfWeek}-${courseTime.timePeriod}`,
        name: courseGroup?.name || `课程-${courseInfo.courseID}`,
        teacher: `教师-${courseInfo.teacherID}`, // 实际应用中可能需要查询教师姓名
        location: courseInfo.location,
        dayOfWeek,
        startTime: timeInfo.startTime,
        endTime: timeInfo.endTime,
        status,
        waitingRank
      });
    }
  });

  return courses;
};

// 获取课表数据的主函数
const fetchCourseTable = async (userToken: string): Promise<Course[]> => {
  try {
    // 1. 获取用户信息
    const userInfo = await new Promise<SafeUserInfo>((resolve, reject) => {
      new QuerySafeUserInfoByTokenMessage(userToken).send(
        (info: string) => {
          try {
            const data = JSON.parse(info);
            resolve(new SafeUserInfo(data.userID, data.userName, data.accountName, data.role));
          } catch (e) {
            reject(e);
          }
        },
        (error: string) => reject(new Error(error))
      );
    });

    let allCourses: Course[] = [];

    if (userInfo.role === UserRole.teacher) {
      // 教师：查询自己开设的课程
      const teacherCourses = await new Promise<CourseInfo[]>((resolve, reject) => {
        new QueryOwnCoursesMessage(userToken).send(
          (info: string) => {
            try {
              const data = JSON.parse(info);
              const courses = Array.isArray(data) ? data : [];
              resolve(courses.map((c: any) => new CourseInfo(
                c.courseID, c.courseCapacity, c.time, c.location, 
                c.courseGroupID, c.teacherID, c.preselectedStudentsSize, 
                c.selectedStudentsSize, c.waitingListSize
              )));
            } catch (e) {
              reject(e);
            }
          },
          (error: string) => reject(new Error(error))
        );
      });

      // 转换教师课程
      for (const courseInfo of teacherCourses) {
        const courses = await convertCourseInfoToCourse(courseInfo, userToken);
        allCourses.push(...courses);
      }

    } else if (userInfo.role === UserRole.student) {
      // 学生：根据选课阶段查询不同的课程
      
      // 2. 获取当前选课阶段
      const semesterPhase = await new Promise<SemesterPhase>((resolve, reject) => {
        new QuerySemesterPhaseStatusMessage(userToken).send(
          (info: string) => {
            try {
              const data = JSON.parse(info);
              resolve(new SemesterPhase(data.currentPhase, data.permissions));
            } catch (e) {
              reject(e);
            }
          },
          (error: string) => reject(new Error(error))
        );
      });

      if (semesterPhase.currentPhase === Phase.phase1) {
        // 阶段1：查询预选课程
        const preselectedCourses = await new Promise<CourseInfo[]>((resolve, reject) => {
          new QueryStudentPreselectedCoursesMessage(userToken).send(
            (info: string) => {
              try {
                const data = JSON.parse(info);
                const courses = Array.isArray(data) ? data : [];
                resolve(courses.map((c: any) => new CourseInfo(
                  c.courseID, c.courseCapacity, c.time, c.location, 
                  c.courseGroupID, c.teacherID, c.preselectedStudentsSize, 
                  c.selectedStudentsSize, c.waitingListSize
                )));
              } catch (e) {
                reject(e);
              }
            },
            (error: string) => reject(new Error(error))
          );
        });

        // 转换预选课程
        for (const courseInfo of preselectedCourses) {
          const courses = await convertCourseInfoToCourse(courseInfo, userToken, CourseStatus.PRESELECTED);
          allCourses.push(...courses);
        }

      } else if (semesterPhase.currentPhase === Phase.phase2) {
        // 阶段2：查询已选课程和候补课程
        
        // 查询已选课程
        const selectedCourses = await new Promise<CourseInfo[]>((resolve, reject) => {
          new QueryStudentSelectedCoursesMessage(userToken).send(
            (info: string) => {
              try {
                const data = JSON.parse(info);
                const courses = Array.isArray(data) ? data : [];
                resolve(courses.map((c: any) => new CourseInfo(
                  c.courseID, c.courseCapacity, c.time, c.location, 
                  c.courseGroupID, c.teacherID, c.preselectedStudentsSize, 
                  c.selectedStudentsSize, c.waitingListSize
                )));
              } catch (e) {
                reject(e);
              }
            },
            (error: string) => reject(new Error(error))
          );
        });

        // 转换已选课程
        for (const courseInfo of selectedCourses) {
          const courses = await convertCourseInfoToCourse(courseInfo, userToken, CourseStatus.SELECTED);
          allCourses.push(...courses);
        }

        // 查询候补课程
        const waitingListStatus = await new Promise<PairOfCourseAndRank[]>((resolve, reject) => {
          new QueryStudentWaitingListStatusMessage(userToken).send(
            (info: string) => {
              try {
                const data = JSON.parse(info);
                const waitingList = Array.isArray(data) ? data : [];
                resolve(waitingList.map((item: any) => new PairOfCourseAndRank(
                  new CourseInfo(
                    item.course.courseID, item.course.courseCapacity, item.course.time, 
                    item.course.location, item.course.courseGroupID, item.course.teacherID, 
                    item.course.preselectedStudentsSize, item.course.selectedStudentsSize, 
                    item.course.waitingListSize
                  ),
                  item.rank
                )));
              } catch (e) {
                reject(e);
              }
            },
            (error: string) => reject(new Error(error))
          );
        });

        // 转换候补课程
        for (const pair of waitingListStatus) {
          const courses = await convertCourseInfoToCourse(pair.course, userToken, CourseStatus.WAITING, pair.rank);
          allCourses.push(...courses);
        }
      }
    }

    return allCourses;

  } catch (error) {
    console.error('获取课表数据失败:', error);
    message.error('获取课表数据失败: ' + (error instanceof Error ? error.message : '未知错误'));
    return [];
  }
};

// 定义时间段
const timeSlots = [
  { id: 1, name: '第一大节', time: '08:00-09:35' },
  { id: 2, name: '第二大节', time: '09:50-12:15' },
  { id: 3, name: '第三大节', time: '13:30-15:05' },
  { id: 4, name: '第四大节', time: '15:20-16:55' },
  { id: 5, name: '第五大节', time: '17:05-18:40' },
  { id: 6, name: '第六大节', time: '19:20-21:45' }
];

export const courseTablePagePath = '/course-table';

const CourseTablePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const userToken = useUserToken();

  useEffect(() => {
    const loadCourseTable = async () => {
      if (!userToken) {
        setError('用户未登录');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 首先获取用户角色
        const userInfo = await new Promise<SafeUserInfo>((resolve, reject) => {
          new QuerySafeUserInfoByTokenMessage(userToken).send(
            (info: string) => {
              try {
                const data = JSON.parse(info);
                resolve(new SafeUserInfo(data.userID, data.userName, data.accountName, data.role));
              } catch (e) {
                reject(e);
              }
            },
            (error: string) => reject(new Error(error))
          );
        });
        
        setUserRole(userInfo.role);
        
        // 获取课表数据
        const data = await fetchCourseTable(userToken);
        setCourses(data);
        setLoading(false);
      } catch (err) {
        console.error('加载课表失败:', err);
        setError('无法加载课程表数据: ' + (err instanceof Error ? err.message : '未知错误'));
        setLoading(false);
      }
    };

    loadCourseTable();
  }, [userToken]);

  // 将课程按星期几和时间段分组
  const getCourseForSlot = (day: number, slotId: number): Course | null => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return null;

    // 简单匹配 - 实际应用中可能需要更精确的时间匹配
    return courses.find(c => 
      c.dayOfWeek === day && 
      c.startTime === slot.time.split('-')[0]
    ) || null;
  };

  // 准备表格数据
  const tableData = timeSlots.map(slot => {
    const rowData: any = {
      key: slot.id,
      timeSlot: slot,
    };
    
    // 为每一天添加课程数据
    [1, 2, 3, 4, 5, 6, 7].forEach(day => {
      const course = getCourseForSlot(day, slot.id);
      rowData[`day${day}`] = course;
    });
    
    return rowData;
  });

  // 渲染课程卡片
  const renderCourseCard = (course: Course | null) => {
    if (!course) {
      return <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d9d9d9' }}></div>;
    }

    // 根据课程状态确定卡片样式
    let cardStyle = {
      margin: 0,
      backgroundColor: 'rgb(255, 240, 249)', // 默认样式
      border: '1px solid #d9d9d9',
      borderRadius: '6px',
      minHeight: '80px',
      boxShadow: 'none'
    };

    let statusTag = null;

    if (userRole === UserRole.student && course.status) {
      switch (course.status) {
        case CourseStatus.SELECTED:
          cardStyle.backgroundColor = 'rgb(240, 255, 240)'; // 浅绿色
          cardStyle.border = '1px solid #52c41a';
          statusTag = <Tag color="success" style={{ fontSize: '10px' }}>已选</Tag>;
          break;
        case CourseStatus.WAITING:
          cardStyle.backgroundColor = 'rgb(255, 245, 230)'; // 浅橙色
          cardStyle.border = '1px solid #fa8c16';
          statusTag = (
            <Tag color="warning" style={{ fontSize: '10px' }}>
              候补{course.waitingRank ? ` (第${course.waitingRank}位)` : ''}
            </Tag>
          );
          break;
        case CourseStatus.PRESELECTED:
          cardStyle.backgroundColor = 'rgb(240, 245, 255)'; // 浅蓝色
          cardStyle.border = '1px solid #1890ff';
          statusTag = <Tag color="processing" style={{ fontSize: '10px' }}>预选</Tag>;
          break;
        default:
          break;
      }
    }

    return (
      <Card
        size="small"
        style={cardStyle}
        bodyStyle={{ padding: '8px' }}
      >
        <div style={{ textAlign: 'center' }}>
          {statusTag && (
            <div style={{ marginBottom: '4px', textAlign: 'right' }}>
              {statusTag}
            </div>
          )}
          <div style={{ 
            fontWeight: 'bold', 
            color: '#0050b3', 
            fontSize: '14px',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {course.name}
          </div>
          <div style={{ 
            color: '#003a8c', 
            fontSize: '12px',
            marginBottom: '2px'
          }}>
            {course.teacher}
          </div>
          <div style={{ 
            color: '#096dd9', 
            fontSize: '11px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {course.location}
          </div>
        </div>
      </Card>
    );
  };

  // 表格列配置
  const columns = [
    {
      title: '时间',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: '12%',
      align: 'center' as const,
      render: (slot: any) => (
        <div style={{ textAlign: 'center', padding: '8px' }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: '#262626',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            {slot.name}
          </div>
          <div style={{ 
            color: '#666', 
            fontSize: '12px'
          }}>
            {slot.time}
          </div>
        </div>
      ),
    },
    {
      title: '星期一',
      dataIndex: 'day1',
      key: 'day1',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期二',
      dataIndex: 'day2',
      key: 'day2',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期三',
      dataIndex: 'day3',
      key: 'day3',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期四',
      dataIndex: 'day4',
      key: 'day4',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期五',
      dataIndex: 'day5',
      key: 'day5',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期六',
      dataIndex: 'day6',
      key: 'day6',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期日',
      dataIndex: 'day7',
      key: 'day7',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
  ];

  const renderContent = () => (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, color: '#1e40af', fontWeight: 700, margin: 0 }}>课程表</h2>
      </div>
      <div style={{ background: '#fff', borderRadius: 0, padding: 0, minHeight: 400 }}>
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={false}
          bordered
          size="small"
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'course-table-row-even' : 'course-table-row-odd'
          }
          style={{
            backgroundColor: '#fff',
            width: '100%'
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      {userRole === null ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <WithRoleBasedSidebarLayout role={userRole}>
          <BackgroundLayout
            gradient="linear-gradient(135deg,rgb(220, 241, 255) 0%, #e0f2fe 100%)"
            contentMaxWidth="90%"
            contentStyle={{ maxWidth: 1200 }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" />
              </div>
            ) : error ? (
              <div className="course-table-error" style={{ textAlign: 'center', color: '#ff4d4f', fontSize: '16px', marginTop: '50px' }}>
                {error}
              </div>
            ) : (
              renderContent()
            )}
          </BackgroundLayout>
        </WithRoleBasedSidebarLayout>
      )}
    </>
  );
};

export default CourseTablePage;