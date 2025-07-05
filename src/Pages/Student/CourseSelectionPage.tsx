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
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  TeamOutlined,
  PlusOutlined
} from '@ant-design/icons';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';

const { Title, Text } = Typography;

// 假设Course类型如下
interface Course {
  courseID: string;
  groupName: string;
  courseName: string;
  teacher: string;
  schedule: string;
  capacity: number;
  studentList: string[];
  waitingList: string[];
  location: string;
}

const userRole: UserRole = UserRole.student;
const userID = 'student1';

// 模拟课程数据
const mockAllCourses: Course[] = [
  {
    courseID: 'c1',
    groupName: '数学组',
    courseName: '高等数学',
    teacher: 'teacher1',
    schedule: '周一 8:00-10:00',
    capacity: 2,
    studentList: ['student2'],
    waitingList: [],
    location: '教室A',
  },
  {
    courseID: 'c2',
    groupName: '物理组',
    courseName: '大学物理',
    teacher: 'teacher2',
    schedule: '周二 10:00-12:00',
    capacity: 1,
    studentList: ['student3', 'student4'],
    waitingList: ['student5'],
    location: '教室B',
  },
  {
    courseID: 'c3',
    groupName: '数学组',
    courseName: '线性代数',
    teacher: 'teacher1',
    schedule: '周三 14:00-16:00',
    capacity: 3,
    studentList: [],
    waitingList: [],
    location: '教室C',
  },
];

// 模拟选课API
const mockSelectCourse = async (studentID: string, course: Course) => {
  if (course.studentList.length < course.capacity) {
    return { status: 'success' };
  }
  if (!course.waitingList.includes(studentID)) {
    return { status: 'waiting' };
  }
  return { status: 'fail' };
};

export const courseSelectionPagePath = '/student/course-selection';

export const CourseSelectionPage: React.FC = () => {
  const [form] = Form.useForm();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setAllCourses(mockAllCourses);
    setFilteredCourses(mockAllCourses);
  }, []);

  const handleSearch = (values: any) => {
    setSearching(true);
    let result = allCourses;
    
    Object.keys(values).forEach(key => {
      if (values[key]) {
        result = result.filter(course => 
          course[key as keyof Course]?.toString().includes(values[key])
        );
      }
    });
    
    setFilteredCourses(result);
    setSearching(false);
  };

  const handleSelect = async (course: Course) => {
    const res = await mockSelectCourse(userID, course);
    if (res.status === 'success') {
      message.success('选课成功！');
    } else if (res.status === 'waiting') {
      message.info('课程已满，已进入等待列表');
    } else {
      message.error('选课失败，您已在等待列表中');
    }
  };

  const renderCourseCard = (course: Course) => {
    const availableSlots = course.capacity - course.studentList.length;
    const isFull = availableSlots <= 0;

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
                  {course.courseID} · {course.groupName}
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
            <Text>{course.teacher}</Text>
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
              <Badge count={course.studentList.length} style={{ backgroundColor: '#52c41a' }} />
              <Text>/</Text>
              <Text strong>{course.capacity}</Text>
              {course.waitingList.length > 0 && (
                <>
                  <Text type="secondary">等待:</Text>
                  <Badge count={course.waitingList.length} style={{ backgroundColor: '#faad14' }} />
                </>
              )}
            </Space>
          </div>
        </Space>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleSelect(course)}
            style={{
              background: isFull ? 
                'linear-gradient(90deg, #faad14 0%, #ffc53d 100%)' : 
                'linear-gradient(90deg, #ff69b4 0%, #ff85c0 100%)',
              border: 'none',
              borderRadius: 8,
              boxShadow: `0 4px 12px ${isFull ? 'rgba(250, 173, 20, 0.3)' : 'rgba(255, 105, 180, 0.3)'}`
            }}
          >
            {isFull ? '加入等待列表' : '立即选课'}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <DefaultLayout role={userRole}>
      <div style={{ 
        padding: '24px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* 页面标题 */}
          <Title level={2} style={{ color: '#d81b60', textAlign: 'center', marginBottom: '32px' }}>
            课程选择中心
          </Title>
          
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
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CourseSelectionPage;