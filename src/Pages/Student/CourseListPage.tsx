import React, { useEffect, useState } from 'react';
// import { CourseInfo } from 'Plugins/CourseService/Objects/Course';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { Button, List, Popconfirm, message, Tag, Card, Avatar, Space, Typography, Divider } from 'antd';
import { BookOutlined, UserOutlined, EnvironmentOutlined, CloseOutlined } from '@ant-design/icons';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout from '../../Layouts/BackgroundLayout';

const { Title, Text } = Typography;

// WANRING: THIS IS JUST TEMPORARY! TO BE REPLACED WITH ACTUAL COURSE OBJECTS
class Course {
    constructor(
        public  courseID: string,
        public  groupID: string,
        public  teacherID: string,
        public  capacity: number,
        public  schedule: string[],
        public  studentList: string[],
        public  waitingList: string[],
        public  location: string
    ) {
        
    }
}


// 类型安全的mock数据函数
const mockFetchStudentCourses = async (studentID: string): Promise<Course[]> => {
  return [
    new Course('c1', 'g1', 'teacher1', 30, [], ['student1', 'student2'], [], '教学楼A-201'),
    new Course('c2', 'g1', 'teacher2', 25, [], ['student1'], [], '教学楼B-105'),
    new Course('c3', 'g2', 'teacher3', 40, [], ['student1'], [], '实验楼C-301'),
    new Course('c4', 'g3', 'teacher4', 35, [], ['student1'], [], '教学楼D-102'),
    new Course('c5', 'g4', 'teacher5', 28, [], ['student1'], [], '实验楼E-203'),
    new Course('c6', 'g5', 'teacher6', 32, [], ['student1'], [], '教学楼F-304'),
    new Course('c7', 'g6', 'teacher7', 45, [], ['student1'], [], '实验楼G-405'),
    new Course('c8', 'g7', 'teacher8', 38, [], ['student1'], [], '教学楼H-506'),
  ];
};

// 模拟课程组数据
const mockCourseGroups = [
  { groupID: 'g1', groupName: '高等数学组', courseName: '高等数学' },
  { groupID: 'g2', groupName: '大学物理组', courseName: '大学物理' },
  { groupID: 'g3', groupName: '线性代数组', courseName: '线性代数' },
  { groupID: 'g4', groupName: '概率统计组', courseName: '概率统计' },
  { groupID: 'g5', groupName: '计算机程序设计组', courseName: '计算机程序设计' },
  { groupID: 'g6', groupName: '数据结构组', courseName: '数据结构' },
  { groupID: 'g7', groupName: '算法分析组', courseName: '算法分析' },
];

// 根据课程组ID获取课程名称
const getCourseNameByGroupID = (groupID: string): string => {
  const group = mockCourseGroups.find(g => g.groupID === groupID);
  return group ? group.courseName : `课程-${groupID}`;
};

const mockDropCourse = async (studentID: string, courseID: string): Promise<boolean> => {
  return true;
};

// 从全局store获取的类型安全数据
const userID: string = 'admin';
const userRole: UserRole = UserRole.student;

export const studentCourseListPagePath = '/student/course-list';

export const StudentCourseListPage: React.FC = () => {
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(5); // 每页显示5门课程

  // 学生加载已选课程 - 类型安全的异步操作
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const courses = await mockFetchStudentCourses(userID);
        setStudentCourses(courses);
      } catch (error) {
        message.error('加载课程失败');
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // 学生端退课 - 类型安全的异步操作
  const handleDropCourse = async (courseID: string) => {
  setLoading(true);
  try {
    const success = await mockDropCourse(userID, courseID);
    if (success) {
      // 使用setTimeout让UI更新更平滑
      setTimeout(() => {
        setStudentCourses(prevCourses => 
          prevCourses.filter(c => c.courseID !== courseID)
        );
        message.success('退课成功');
        setLoading(false);
      }, 100);
    } else {
      message.error('退课失败');
      setLoading(false);
    }
  } catch (error) {
    message.error('退课操作出错');
    console.error('Failed to drop course:', error);
    setLoading(false);
  }
};

  // 计算当前页面显示的高度
  const calculateCardHeight = (): string => {
    const baseHeight = 120; // 基础高度
    const compactHeight = 100; // 紧凑模式高度
    return studentCourses.length > 4 ? `${compactHeight}px` : `${baseHeight}px`;
  };

  const renderContent = () => {
    return (
      <BackgroundLayout
        gradient="linear-gradient(135deg,rgb(246, 236, 242) 0%,rgb(255, 231, 250) 100%)"
        contentMaxWidth="800px"
        contentPadding="16px 24px"
        contentStyle={{ borderRadius: '16px' }} // 移除全局滚动
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 标题部分 - 固定不动 */}
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Title level={4} style={{ color: '#2c3e50', marginBottom: 0 }}>
              <BookOutlined /> 我的课程
            </Title>
            <Text type="secondary">当前已选 {studentCourses.length} 门课程</Text>
          </div>
          
          <Divider style={{ margin: '4px 0' }} />
          
          {/* 课程列表部分 - 单独设置滚动 */}
          <div style={{ 
            maxHeight: 'calc(80vh - 120px)', // 计算高度，留出标题空间
            overflowY: 'auto',
            paddingRight: '8px', // 防止滚动条遮挡内容
          }}>
            <List
              loading={loading}
              dataSource={studentCourses}
              pagination={{
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['5', '8', '10'],
                onShowSizeChange: (_, size) => setPageSize(size),
                showTotal: (total) => `共 ${total} 门课程`,
                size: 'small',
              }}
              locale={{ emptyText: '您还没有选择任何课程' }}
              renderItem={(course: Course) =>  (
              <Card
                hoverable
                style={{ 
                  marginBottom: '12px', 
                  borderRadius: '8px',
                  height: calculateCardHeight(), // 动态调整高度
                }}
                bodyStyle={{ 
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  flex: 1,
                }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Space direction="vertical" size={4}> {/* 减小元素间距 */}
                      <Text strong ellipsis style={{ fontSize: '14px' }}>
                        {getCourseNameByGroupID(course.groupID)} - {course.courseID}
                      </Text>
                      
                      <Space size={4} wrap> {/* 减小标签间距并允许换行 */}
                        <Tag icon={<UserOutlined />} color="geekblue" style={{ margin: 0 }}>
                          教师: {course.teacherID}
                        </Tag>
                        <Tag icon={<EnvironmentOutlined />} color="purple" style={{ margin: 0 }}>
                          {course.location}
                        </Tag>
                        <Tag color="cyan" style={{ margin: 0 }}>
                          容量: {course.capacity}
                        </Tag>
                      </Space>
                    </Space>
                  </div>
                  
                  <Popconfirm
                    title="确定要退选该课程吗？"
                    description="退课后将无法恢复，请确认"
                    onConfirm={() => handleDropCourse(course.courseID)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      danger
                      type="text"
                      icon={<CloseOutlined />}
                      style={{ 
                        color: '#e74c3c',
                        alignSelf: 'flex-start', // 按钮顶部对齐
                      }}
                      size="small" // 使用小号按钮
                    />
                  </Popconfirm>
                </div>
              </Card>
            )}
          />
          </div>
        </Space>
      </BackgroundLayout>
    );
  };

  return (
    <DefaultLayout role={userRole}>
      <div style={{ padding: '24px' }}>
        {renderContent()}
      </div>
    </DefaultLayout>
  );
};

export default StudentCourseListPage;

