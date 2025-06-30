import React, { useEffect, useState } from 'react';
import { CourseGroup } from 'Plugins/CourseService/Objects/CourseGroup';
import { Course } from 'Plugins/CourseService/Objects/Course';
import { UserRole } from 'Plugins/UserService/Objects/UserRole';
import { Button, Collapse, List, Modal, Input, Form, Popconfirm, message, Tag } from 'antd';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';

// TODO: Replace with real API calls
const mockFetchCourseGroups = async (): Promise<CourseGroup[]> => {
  return [
    new CourseGroup('g1', '数学组', 10, 'owner1', ['teacher1']),
    new CourseGroup('g2', '物理组', 8, 'owner2', ['teacher1', 'teacher2']),
  ];
};

const mockFetchCourses = async (groupID: string, teacherID: string): Promise<Course[]> => {
  if (groupID === 'g1') {
    return [
      new Course('c1', 'g1', teacherID, 30, [], ['student1', 'student2'], [], '教室A'),
      new Course('c2', 'g1', teacherID, 25, [], [], [], '教室B'),
    ];
  }
  if (groupID === 'g2') {
    return [
      new Course('c3', 'g2', teacherID, 40, [], ['student1'], [], '教室C'),
    ];
  }
  return [];
};

const mockFetchStudentCourses = async (studentID: string): Promise<Course[]> => {
  // 假设学生选了c1和c3
  return [
    new Course('c1', 'g1', 'teacher1', 30, [], ['student1', 'student2'], [], '教室A'),
    new Course('c3', 'g2', 'teacher2', 40, [], ['student1'], [], '教室C'),
  ];
};

const mockDropCourse = async (studentID: string, courseID: string) => {
  // 模拟退课
  return true;
};

// TODO: 从全局store获取
const userID = 'admin'; // 或 'teacher1'
const userRole: UserRole = UserRole.student; // 或 UserRole.teacher

export const studentCourseListPagePath = '/course-list';

export const StudentCourseListPage: React.FC = () => {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [courses, setCourses] = useState<Record<string, Course[]>>({});
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{visible: boolean, type: 'group'|'course'|null, mode: 'add'|'edit', groupID?: string, course?: Course, group?: CourseGroup}>({visible: false, type: null, mode: 'add'});
  const [form] = Form.useForm();


  // 学生加载已选课程
  useEffect(() => {
      setLoading(true);
      mockFetchStudentCourses(userID).then(cs => {
        setStudentCourses(cs);
        setLoading(false);
      });
  }, []);

  const handleExpand = async (groupID: string) => {
    if (!expanded.includes(groupID)) {
      setLoading(true);
      const cs = await mockFetchCourses(groupID, userID);
      setCourses(prev => ({...prev, [groupID]: cs}));
      setLoading(false);
      setExpanded([...expanded, groupID]);
    } else {
      setExpanded(expanded.filter(id => id !== groupID));
    }
  };

  // 学生端退课
  const handleDropCourse = async (courseID: string) => {
    setLoading(true);
    const ok = await mockDropCourse(userID, courseID);
    if (ok) {
      setStudentCourses(studentCourses.filter(c => c.courseID !== courseID));
      message.success('已退课');
    } else {
      message.error('退课失败');
    }
    setLoading(false);
  };

  const renderContent = () => {
  
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 mt-8">
          <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700 drop-shadow">我已选的课程</h2>
          <List
            bordered
            loading={loading}
            dataSource={studentCourses}
            locale={{emptyText: '暂无已选课程'}}
            renderItem={course => (
              <List.Item
                className="rounded-lg border border-purple-100 my-2 bg-purple-50"
                actions={[
                  <Popconfirm title="确定要退选该课程吗？" onConfirm={() => handleDropCourse(course.courseID)}>
                    <Button size="small" danger style={{ background: '#f3e8ff', color: '#a21caf', border: 'none' }}>退课</Button>
                  </Popconfirm>
                ]}
              >
                <div>
                  <div className="text-purple-900 font-medium">{course.location} <span className="text-purple-400">(容量: {course.capacity})</span></div>
                  <div className="text-purple-700 text-sm">课程ID: {course.courseID}</div>
                  <div className="text-purple-700 text-sm">教师ID: {course.teacherID}</div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    );
  }

  
  return (
    <DefaultLayout role={userRole}>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
        {renderContent()}
      </div>
    </DefaultLayout>
  );
};

export default StudentCourseListPage;