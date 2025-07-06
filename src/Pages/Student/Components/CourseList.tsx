// CourseList.tsx
import React from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import { CourseCard } from './CourseCard';

// 使用与主页面一致的课程数据接口
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

interface CourseListProps {
  courses: CourseDisplayData[];
  loading: boolean;
  canSelectCourse: boolean;
  canPreselectCourse: boolean;
  selectedCourses: CourseDisplayData[];
  preselectedCourses: CourseDisplayData[];
  waitingListCourses: any[];
  onSelectCourse: (courseData: CourseDisplayData) => void;
  onPreselectCourse: (courseData: CourseDisplayData) => void;
  onDropCourse: (courseData: CourseDisplayData) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  loading,
  canSelectCourse,
  canPreselectCourse,
  selectedCourses,
  preselectedCourses,
  waitingListCourses,
  onSelectCourse,
  onPreselectCourse,
  onDropCourse
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="正在加载课程信息..." />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Empty
        description="暂无符合条件的课程"
        style={{
          padding: '50px',
          color: '#999'
        }}
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {courses.map((course) => (
        <Col xs={24} sm={12} md={8} lg={6} key={`${course.courseID}-${course.courseGroupID}`}>
          <CourseCard
            courseData={course}
            canSelectCourse={canSelectCourse}
            canPreselectCourse={canPreselectCourse}
            selectedCourses={selectedCourses}
            preselectedCourses={preselectedCourses}
            waitingListCourses={waitingListCourses}
            onSelectCourse={onSelectCourse}
            onPreselectCourse={onPreselectCourse}
            onDropCourse={onDropCourse}
          />
        </Col>
      ))}
    </Row>
  );
};
