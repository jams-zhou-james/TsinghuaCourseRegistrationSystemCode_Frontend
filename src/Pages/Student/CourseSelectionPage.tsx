// CourseSelectionPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  Input, 
  Button, 
  message, 
  Form, 
  Row, 
  Col, 
  Tag, 
  Card, 
  Typography, 
  Space, 
  Divider,
  Badge,
  Empty,
  Tabs,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  TeamOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import WithRoleBasedSidebarLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { useUserToken } from 'Globals/GlobalStore';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
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
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';

// 选课相关
import { SelectCourseMessage } from 'Plugins/CourseSelectionService/APIs/SelectCourseMessage';
import { PreselectCourseMessage } from 'Plugins/CourseSelectionService/APIs/PreselectCourseMessage';
import { DropCourseMessage } from 'Plugins/CourseSelectionService/APIs/DropCourseMessage';
import { QueryStudentSelectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentSelectedCoursesMessage';
import { QueryStudentPreselectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentPreselectedCoursesMessage';
import { QueryStudentWaitingListStatusMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentWaitingListStatusMessage';
import { PairOfCourseAndRank } from 'Plugins/CourseSelectionService/Objects/PairOfCourseAndRank';

const { Title, Text } = Typography;

// 扩展的Course接口，适配真实API
interface ExtendedCourse {
  courseID: number;
  courseGroupID: number;
  courseName: string;
  courseGroupName: string;
  teacherID: number;
  teacherName: string;
  schedule: string;
  capacity: number;
  location: string;
  credit: number;
  time: CourseTime[];
  
  // 根据阶段显示不同的人数信息
  preselectedCount: number;  // 阶段1显示：预选人数
  selectedCount: number;     // 阶段2显示：选上人数
  waitingCount: number;      // 阶段2显示：等待人数
  
  // 学生状态标识
  isPreselected: boolean;    // 我是否已预选
  isSelected: boolean;       // 我是否已选上
  isInWaitingList: boolean;  // 我是否在等待列表中
  waitingRank?: number;      // 我在等待列表的排名
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
  ).join(', ');
};

// 检查时间冲突
const hasTimeConflict = (course1: ExtendedCourse, course2: ExtendedCourse): boolean => {
  if (!course1.time || !course2.time) return false;
  
  for (const time1 of course1.time) {
    for (const time2 of course2.time) {
      if (time1.dayOfWeek === time2.dayOfWeek && time1.timePeriod === time2.timePeriod) {
        return true;
      }
    }
  }
  return false;
};

export const courseSelectionPagePath = '/student/course-selection';

export const CourseSelectionPage: React.FC = () => {
  const userToken = useUserToken();
  const [form] = Form.useForm();
  
  // 状态管理
  const [userInfo, setUserInfo] = useState<SafeUserInfo | null>(null);
  const [semesterPhase, setSemesterPhase] = useState<SemesterPhase | null>(null);
  const [allCourses, setAllCourses] = useState<ExtendedCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ExtendedCourse[]>([]);
  const [mySelectedCourses, setMySelectedCourses] = useState<ExtendedCourse[]>([]);
  const [myPreselectedCourses, setMyPreselectedCourses] = useState<ExtendedCourse[]>([]);
  const [myWaitingList, setMyWaitingList] = useState<PairOfCourseAndRank[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // API数据转换函数
  const transformToCourse = (pair: PairOfGroupAndCourse): ExtendedCourse => {
    const courseGroup = pair.CourseGroup;
    const courseInfo = pair.Course;
    
    return {
      courseID: courseInfo.courseID,
      courseGroupID: courseGroup.courseGroupID,
      courseName: courseGroup.name,
      courseGroupName: courseGroup.name,
      teacherID: courseInfo.teacherID,
      teacherName: courseGroup.authorizedTeachers?.join(', ') || `教师${courseInfo.teacherID}`,
      schedule: formatCourseTime(courseInfo.time),
      capacity: courseInfo.courseCapacity,
      location: courseInfo.location,
      credit: courseGroup.credit,
      time: courseInfo.time,
      preselectedCount: courseInfo.preselectedStudentsSize,
      selectedCount: courseInfo.selectedStudentsSize,
      waitingCount: courseInfo.waitingListSize,
      isPreselected: false,
      isSelected: false,
      isInWaitingList: false
    };
  };

  const convertCourseInfoToExtended = (courseInfo: CourseInfo, isSelected: boolean, isPreselected: boolean, isInWaitingList: boolean): ExtendedCourse => {
    return {
      courseID: courseInfo.courseID,
      courseGroupID: courseInfo.courseGroupID,
      courseName: `课程${courseInfo.courseID}`,
      courseGroupName: `课程组${courseInfo.courseGroupID}`,
      teacherID: courseInfo.teacherID,
      teacherName: `教师${courseInfo.teacherID}`,
      schedule: formatCourseTime(courseInfo.time),
      capacity: courseInfo.courseCapacity,
      location: courseInfo.location,
      credit: 0,
      time: courseInfo.time,
      preselectedCount: courseInfo.preselectedStudentsSize,
      selectedCount: courseInfo.selectedStudentsSize,
      waitingCount: courseInfo.waitingListSize,
      isPreselected,
      isSelected,
      isInWaitingList
    };
  };

  // 页面初始化 - 参考Teacher页面的简化模式
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

  const loadAllCourses = (filters: any = {}) => {
    new QueryCoursesByFilterMessage(
      userToken,
      filters.courseGroupID ? parseInt(filters.courseGroupID) : null,
      filters.courseName || null,
      filters.teacher || null,
      []
    ).send(
      (response: string) => {
        try {
          const apiData: PairOfGroupAndCourse[] = JSON.parse(response);
          const courses = apiData.map(transformToCourse);
          updateCourseStatuses(courses);
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
      (response: string) => {
        try {
          const courses: CourseInfo[] = JSON.parse(response);
          setMySelectedCourses(courses.map(c => convertCourseInfoToExtended(c, true, false, false)));
        } catch (e) {
          setMySelectedCourses([]);
        }
      },
      () => setMySelectedCourses([])
    );

    // 加载预选课程
    new QueryStudentPreselectedCoursesMessage(userToken).send(
      (response: string) => {
        try {
          const courses: CourseInfo[] = JSON.parse(response);
          setMyPreselectedCourses(courses.map(c => convertCourseInfoToExtended(c, false, true, false)));
        } catch (e) {
          setMyPreselectedCourses([]);
        }
      },
      () => setMyPreselectedCourses([])
    );

    // 加载等待列表
    new QueryStudentWaitingListStatusMessage(userToken).send(
      (response: string) => {
        try {
          const waitingList: PairOfCourseAndRank[] = JSON.parse(response);
          setMyWaitingList(waitingList);
        } catch (e) {
          setMyWaitingList([]);
        }
      },
      () => setMyWaitingList([])
    );
  };

  // 更新课程状态标识
  const updateCourseStatuses = (courses: ExtendedCourse[]) => {
    courses.forEach(course => {
      // 检查是否在已选课程中
      course.isSelected = mySelectedCourses.some(selected => selected.courseID === course.courseID);
      
      // 检查是否在预选课程中
      course.isPreselected = myPreselectedCourses.some(preselected => preselected.courseID === course.courseID);
      
      // 检查是否在等待列表中
      const waitingItem = myWaitingList.find(waiting => waiting.course.courseID === course.courseID);
      course.isInWaitingList = !!waitingItem;
      course.waitingRank = waitingItem?.rank;
    });
  };

  const handleSearch = (values: any) => {
    setSearching(true);
    let result = allCourses;
    
    Object.keys(values).forEach(key => {
      if (values[key]) {
        result = result.filter(course => {
          const courseValue = (course as any)[key];
          return courseValue?.toString().includes(values[key]);
        });
      }
    });
    
    setFilteredCourses(result);
    setSearching(false);
  };

  const handleSelect = async (course: ExtendedCourse) => {
    if (!semesterPhase) {
      message.error('学期阶段信息未加载');
      return;
    }

    // 检查时间冲突
    const conflictCourse = mySelectedCourses.find(selectedCourse => 
      hasTimeConflict(course, selectedCourse)
    );
    if (conflictCourse) {
      message.error(`与已选课程"${conflictCourse.courseName}"时间冲突`);
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

  const handleDropCourse = (course: ExtendedCourse) => {
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

  const renderCourseCard = (course: ExtendedCourse) => {
    if (!semesterPhase) return null;
    
    const isPhase1 = semesterPhase.currentPhase === Phase.phase1;
    const currentCount = isPhase1 ? course.preselectedCount : course.selectedCount;
    const availableSlots = course.capacity - currentCount;
    const isFull = availableSlots <= 0;

    // 确定按钮状态和文本
    let buttonText = '';
    let buttonDisabled = false;
    let showDropButton = false;
    
    if (course.isSelected) {
      buttonText = '已选上';
      buttonDisabled = true;
      showDropButton = true;
    } else if (course.isPreselected) {
      buttonText = '已预选';
      buttonDisabled = true;
      showDropButton = true;
    } else if (course.isInWaitingList) {
      buttonText = `等待中(${course.waitingRank}/${course.waitingCount})`;
      buttonDisabled = true;
    } else {
      buttonText = isFull 
        ? (isPhase1 ? '预选(排队)' : '选课(排队)') 
        : (isPhase1 ? '立即预选' : '立即选课');
    }

    return (
      <Card
        key={course.courseID}
        hoverable
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255, 182, 216, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 8px rgba(255, 105, 180, 0.1)'
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0, color: '#d81b60' }}>
                  {course.courseName}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ID:{course.courseID} · {course.courseGroupName} · {course.credit}学分
                </Text>
              </div>
              <Tag color={isFull ? "red" : "green"} style={{ borderRadius: 8 }}>
                {isFull ? "已满" : `余${availableSlots}位`}
              </Tag>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: '12px 0', borderColor: 'rgba(255, 182, 216, 0.3)' }} />

        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ color: '#ff69b4', marginRight: 8 }} />
            <Text>{course.teacherName}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ color: '#ff69b4', marginRight: 8 }} />
            <Text>{course.schedule}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#ff69b4', marginRight: 8 }} />
            <Text>{course.location}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TeamOutlined style={{ color: '#ff69b4', marginRight: 8 }} />
            <Space size={4}>
              <Badge count={currentCount} style={{ backgroundColor: '#52c41a' }} />
              <Text>/</Text>
              <Text strong>{course.capacity}</Text>
              {!isPhase1 && course.waitingCount > 0 && (
                <>
                  <Text type="secondary">等待:</Text>
                  <Badge count={course.waitingCount} style={{ backgroundColor: '#faad14' }} />
                </>
              )}
            </Space>
          </div>
        </Space>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={buttonDisabled}
              onClick={() => handleSelect(course)}
              style={{
                background: buttonDisabled ? undefined : 
                  (isFull ? 
                    'linear-gradient(90deg, #faad14 0%, #ffc53d 100%)' : 
                    'linear-gradient(90deg, #ff69b4 0%, #ff85c0 100%)'),
                border: 'none',
                borderRadius: 8,
                boxShadow: buttonDisabled ? undefined : 
                  `0 4px 12px ${isFull ? 'rgba(250, 173, 20, 0.3)' : 'rgba(255, 105, 180, 0.3)'}`
              }}
            >
              {buttonText}
            </Button>
            
            {showDropButton && (
              <Button
                danger
                icon={<MinusOutlined />}
                onClick={() => handleDropCourse(course)}
                style={{ borderRadius: 8 }}
              >
                退课
              </Button>
            )}
          </Space>
        </div>
      </Card>
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
                  label: `所有课程 (${filteredCourses.length})`,
                  children: (
                    <>
                      {/* 搜索表单 */}
                      <Card
                        title={
                          <Space>
                            <SearchOutlined style={{ color: '#ff69b4' }} />
                            <span style={{ color: '#d81b60' }}>课程搜索</span>
                          </Space>
                        }
                        style={{
                          marginBottom: 24,
                          borderRadius: 12,
                          border: '1px solid rgba(255, 182, 216, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}
                      >
                        <Form form={form} layout="vertical" onFinish={handleSearch}>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item name="courseName" label="课程名称">
                                <Input 
                                  placeholder="请输入课程名称" 
                                  prefix={<BookOutlined style={{ color: '#ffb6d8' }} />}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item name="courseID" label="课程编号">
                                <Input placeholder="请输入课程编号" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item name="teacher" label="授课教师">
                                <Input 
                                  placeholder="请输入教师姓名" 
                                  prefix={<UserOutlined style={{ color: '#ffb6d8' }} />}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                              <Form.Item name="schedule" label="上课时间">
                                <Input 
                                  placeholder="如: 周一 8:00-10:00" 
                                  prefix={<ClockCircleOutlined style={{ color: '#ffb6d8' }} />}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row justify="center" style={{ marginTop: 16 }}>
                            <Button 
                              type="primary" 
                              htmlType="submit" 
                              loading={searching}
                              icon={<SearchOutlined />}
                              style={{
                                background: 'linear-gradient(90deg, #ff69b4 0%, #ff85c0 100%)',
                                border: 'none',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px rgba(255, 105, 180, 0.3)'
                              }}
                            >
                              搜索课程
                            </Button>
                          </Row>
                        </Form>
                      </Card>

                      {/* 课程列表 */}
                      <Card
                        title={
                          <Space>
                            <TeamOutlined style={{ color: '#ff69b4' }} />
                            <span style={{ color: '#d81b60' }}>可选课程</span>
                            <Badge count={filteredCourses.length} style={{ backgroundColor: '#ff69b4' }} />
                          </Space>
                        }
                        style={{
                          borderRadius: 12,
                          border: '1px solid rgba(255, 182, 216, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}
                      >
                        {filteredCourses.length === 0 ? (
                          <Empty 
                            image={<BookOutlined style={{ fontSize: 48, color: '#ffb6d8' }} />}
                            description="暂无符合条件的课程"
                          />
                        ) : (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: 16
                          }}>
                            {filteredCourses.map(renderCourseCard)}
                          </div>
                        )}
                      </Card>
                    </>
                  )
                },
                {
                  key: 'selected',
                  label: `已选课程 (${mySelectedCourses.length})`,
                  children: (
                    mySelectedCourses.length === 0 ? (
                      <Empty description="暂无已选课程" />
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 16
                      }}>
                        {mySelectedCourses.map(renderCourseCard)}
                      </div>
                    )
                  )
                },
                {
                  key: 'preselected',
                  label: `预选课程 (${myPreselectedCourses.length})`,
                  children: (
                    myPreselectedCourses.length === 0 ? (
                      <Empty description="暂无预选课程" />
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 16
                      }}>
                        {myPreselectedCourses.map(renderCourseCard)}
                      </div>
                    )
                  )
                },
                {
                  key: 'waiting',
                  label: `等待列表 (${myWaitingList.length})`,
                  children: (
                    myWaitingList.length === 0 ? (
                      <Empty description="暂无等待列表课程" />
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 16
                      }}>
                        {myWaitingList.map(item => {
                          const course = convertCourseInfoToExtended(item.course, false, false, true);
                          course.waitingRank = item.rank;
                          return renderCourseCard(course);
                        })}
                      </div>
                    )
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