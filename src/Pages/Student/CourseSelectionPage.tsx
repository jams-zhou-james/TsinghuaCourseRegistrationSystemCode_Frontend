// CourseSelectionPage.tsx
import React, { useEffect, useState } from 'react';
import { Input, Button, List, message, Form, Row, Col, Tag } from 'antd';
import DefaultLayout from '../../Layouts/DefaultLayout'; // 确保路径正确
import { UserRole } from 'Plugins/UserService/Objects/UserRole';
// import { Course } from 'Plugins/CourseService/Objects/Course';

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

export const courseSelectionPagePath = '/course-selection';

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

  const renderContent = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 mt-8">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700 drop-shadow">选课系统</h2>
        <Form form={form} layout="vertical" onFinish={handleSearch}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="courseName" label="课程名">
                <Input placeholder="输入课程名" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="courseID" label="课程ID">
                <Input placeholder="输入课程ID" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="teacher" label="开课教师">
                <Input placeholder="输入教师名" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="schedule" label="上课时间">
                <Input placeholder="如 周一 8:00-10:00" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Button type="primary" htmlType="submit" loading={searching} style={{ background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)', border: 'none' }}>
                搜索
              </Button>
            </Col>
          </Row>
        </Form>
        <List
          className="mt-8"
          bordered
          dataSource={filteredCourses}
          locale={{ emptyText: '没有符合条件的课程' }}
          renderItem={course => (
            <List.Item
              className="rounded-lg border border-purple-100 my-2 bg-purple-50"
              actions={[
                <Button
                  size="small"
                  type="primary"
                  style={{ background: '#a78bfa', border: 'none' }}
                  onClick={() => handleSelect(course)}
                >
                  选课
                </Button>
              ]}
            >
              <div>
                <div className="font-semibold text-purple-900">{course.courseName} <Tag color="purple">{course.groupName}</Tag></div>
                <div className="text-purple-700 text-sm">课程ID: {course.courseID}</div>
                <div className="text-purple-700 text-sm">教师: {course.teacher}</div>
                <div className="text-purple-700 text-sm">上课时间: {course.schedule}</div>
                <div className="text-purple-700 text-sm">上课地点: {course.location}</div>
                <div className="text-purple-700 text-sm">容量: {course.capacity}，已选人数: {course.studentList.length}，Waiting List: {course.waitingList.length}</div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
 }
    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
        <DefaultLayout role={userRole}>
            {renderContent()}
        </DefaultLayout>
        </div>
    );
};

export default CourseSelectionPage;