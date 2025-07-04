// CourseSelectionPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  Input,   Button,   List,   message,   Form,   Row,   Col,   Tag,   Card,   Typography,   Space,   Divider,  Badge, Avatar,  Tooltip
} from 'antd';
import { 
  SearchOutlined,   BookOutlined,   UserOutlined,   ClockCircleOutlined,   EnvironmentOutlined,  TeamOutlined,  PlusOutlined
} from '@ant-design/icons';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout'; // 确保路径正确
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
// import { Course } from 'Plugins/CourseService/Objects/Course';

const { Title, Text } = Typography;
const { Search } = Input;

// 假设Course类型如下
type Course = {
  courseID: string;
  groupName: string;
  courseName: string;
  teacher: string;
  schedule: string;
  capacity: number;
  studentList: string[];
  waitingList: string[];
  location: string;
};

const userRole: UserRole = UserRole.student;

// 假设学生ID
const userID = 'student1';

// 模拟所有可选课程
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
  // 选课人数未满
  if (course.studentList.length < course.capacity) {
    return { status: 'success' };
  }
  // 已满但未在waitingList
  if (!course.waitingList.includes(studentID)) {
    return { status: 'waiting' };
  }
  // 已在waitingList
  return { status: 'fail' };
};

export const courseSelectionPagePath = '/student/course-selection';

export const CourseSelectionPage: React.FC = () => {
  const [form] = Form.useForm();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // 加载所有课程
    setAllCourses(mockAllCourses);
    setFilteredCourses(mockAllCourses);
  }, []);

  const handleSearch = (values: any) => {
    setSearching(true);
    let result = allCourses;
    if (values.courseName) {
      result = result.filter(c => c.courseName.includes(values.courseName));
    }
    if (values.courseID) {
      result = result.filter(c => c.courseID.includes(values.courseID));
    }
    if (values.teacher) {
      result = result.filter(c => c.teacher.includes(values.teacher));
    }
    if (values.schedule) {
      result = result.filter(c => c.schedule.includes(values.schedule));
    }
    setFilteredCourses(result);
    setSearching(false);
  };

  const handleSelect = async (course: Course) => {
    const res = await mockSelectCourse(userID, course);
    if (res.status === 'success') {
      message.success('选课成功！');
    } else if (res.status === 'waiting') {
      message.info('课程已满，已进入Waiting List');
    } else {
      message.error('选课失败，您已在Waiting List或其他原因');
    }
  };

  // 渲染课程卡片
  const renderCourseCard = (course: Course) => {
    const availableSlots = course.capacity - course.studentList.length;
    const isFull = availableSlots <= 0;
    const hasWaitingList = course.waitingList.length > 0;

    return (
      <Card
        key={course.courseID}
        hoverable
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255, 182, 216, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 8px rgba(255, 105, 180, 0.1)',
          transition: 'all 0.3s ease'
        }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Space direction="vertical" size={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={4} style={{ margin: 0, color: '#d81b60' }}>
                    {course.courseName}
                  </Title>
                  <Tag color="pink" style={{ borderRadius: 12 }}>
                    {course.groupName}
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  课程编号: {course.courseID}
                </Text>
              </Space>
            </div>
            <div style={{ textAlign: 'right' }}>
              {isFull ? (
                <Tag color="red" style={{ borderRadius: 8 }}>课程已满</Tag>
              ) : (
                <Tag color="green" style={{ borderRadius: 8 }}>还有{availableSlots}个名额</Tag>
              )}
            </div>
          </div>
        </div>

        <Divider style={{ margin: '12px 0', borderColor: 'rgba(255, 182, 216, 0.3)' }} />

        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ color: '#ff69b4', marginRight: 8, fontSize: 14 }} />
            <Text style={{ color: '#666' }}>授课教师：</Text>
            <Text strong style={{ color: '#d81b60', marginLeft: 4 }}>{course.teacher}</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ color: '#ff69b4', marginRight: 8, fontSize: 14 }} />
            <Text style={{ color: '#666' }}>上课时间：</Text>
            <Text strong style={{ color: '#d81b60', marginLeft: 4 }}>{course.schedule}</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#ff69b4', marginRight: 8, fontSize: 14 }} />
            <Text style={{ color: '#666' }}>上课地点：</Text>
            <Text strong style={{ color: '#d81b60', marginLeft: 4 }}>{course.location}</Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TeamOutlined style={{ color: '#ff69b4', marginRight: 8, fontSize: 14 }} />
            <Text style={{ color: '#666' }}>课程容量：</Text>
            <Space size={4} style={{ marginLeft: 4 }}>
              <Badge count={course.studentList.length} style={{ backgroundColor: '#52c41a' }} />
              <Text style={{ color: '#666' }}>/</Text>
              <Text strong style={{ color: '#d81b60' }}>{course.capacity}</Text>
              {hasWaitingList && (
                <>
                  <Divider type="vertical" style={{ borderColor: 'rgba(255, 182, 216, 0.5)' }} />
                  <Text style={{ color: '#666' }}>等待列表：</Text>
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
            size="large"
            onClick={() => handleSelect(course)}
            style={{
              background: isFull ? 
                'linear-gradient(90deg, #faad14 0%, #ffc53d 100%)' : 
                'linear-gradient(90deg, #ff69b4 0%, #ff85c0 100%)',
              border: 'none',
              borderRadius: 8,
              height: 40,
              paddingLeft: 24,
              paddingRight: 24,
              boxShadow: `0 4px 12px ${isFull ? 'rgba(250, 173, 20, 0.3)' : 'rgba(255, 105, 180, 0.3)'}`,
              fontWeight: 500
            }}
          >
            {isFull ? '加入等待列表' : '立即选课'}
          </Button>
        </div>
      </Card>
    );
  };  const renderContent = () => {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* 页面标题 */}
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #ff69b4 0%, #ff85c0 50%, #ffb6d8 100%)',
            border: 'none',
            borderRadius: 16
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={64} 
              icon={<BookOutlined />} 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                marginBottom: 16
              }} 
            />
            <Title level={2} style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              课程选择中心
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16 }}>
              选择您这学期的课程
            </Text>
          </div>
        </Card>

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
          headStyle={{
            borderBottom: '1px solid rgba(255, 182, 216, 0.2)',
            backgroundColor: 'rgba(255, 182, 216, 0.05)'
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSearch}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="courseName" label={<span style={{ color: '#d81b60', fontWeight: 500 }}>课程名称</span>}>
                  <Input 
                    placeholder="请输入课程名称" 
                    prefix={<BookOutlined style={{ color: '#ffb6d8' }} />}
                    style={{ borderColor: '#ffb6d8' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="courseID" label={<span style={{ color: '#d81b60', fontWeight: 500 }}>课程编号</span>}>
                  <Input 
                    placeholder="请输入课程编号" 
                    style={{ borderColor: '#ffb6d8' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="teacher" label={<span style={{ color: '#d81b60', fontWeight: 500 }}>授课教师</span>}>
                  <Input 
                    placeholder="请输入教师姓名" 
                    prefix={<UserOutlined style={{ color: '#ffb6d8' }} />}
                    style={{ borderColor: '#ffb6d8' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="schedule" label={<span style={{ color: '#d81b60', fontWeight: 500 }}>上课时间</span>}>
                  <Input 
                    placeholder="如: 周一 8:00-10:00" 
                    prefix={<ClockCircleOutlined style={{ color: '#ffb6d8' }} />}
                    style={{ borderColor: '#ffb6d8' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="center" style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={searching}
                size="large"
                icon={<SearchOutlined />}
                style={{
                  background: 'linear-gradient(90deg, #ff69b4 0%, #ff85c0 100%)',
                  border: 'none',
                  borderRadius: 8,
                  height: 40,
                  paddingLeft: 32,
                  paddingRight: 32,
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
          headStyle={{
            borderBottom: '1px solid rgba(255, 182, 216, 0.2)',
            backgroundColor: 'rgba(255, 182, 216, 0.05)'
          }}
          bodyStyle={{ padding: 16 }}
        >
          {filteredCourses.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#999'
            }}>
              <BookOutlined style={{ fontSize: 48, color: '#ffb6d8', marginBottom: 16 }} />
              <div style={{ fontSize: 16 }}>暂无符合条件的课程</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>请调整搜索条件后重试</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: 16
            }}>
              {filteredCourses.map(course => renderCourseCard(course))}
            </div>
          )}
        </Card>
      </div>
    );
  };
    return (
        <DefaultLayout role={userRole}>
            <div style={{ 
              padding: '24px',
              minHeight: '100vh',
              background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
            }}>
                {renderContent()}
            </div>
        </DefaultLayout>
    );
};

export default CourseSelectionPage;