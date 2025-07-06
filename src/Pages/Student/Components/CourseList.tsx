// CourseList.tsx
import React from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import { CourseCard } from './CourseCard';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';

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
  selectedCourses: CourseDisplayData[];
  preselectedCourses: CourseDisplayData[];
  semesterPhase?: SemesterPhase | null;
  onSelectCourse: (courseData: CourseDisplayData) => void;
  onPreselectCourse: (courseData: CourseDisplayData) => void;
  onDropCourse: (courseData: CourseDisplayData) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  selectedCourses,
  preselectedCourses,
  semesterPhase,
  onSelectCourse,
  onPreselectCourse,
  onDropCourse
}) => {
  // 根据学期阶段确定权限
  const canSelectCourse = semesterPhase?.currentPhase === Phase.phase2;
  const canPreselectCourse = semesterPhase?.currentPhase === Phase.phase1;
  
  if (!courses || courses.length === 0) {
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
            semesterPhase={semesterPhase}
            onSelectCourse={onSelectCourse}
            onPreselectCourse={onPreselectCourse}
            onDropCourse={onDropCourse}
          />
        </Col>
      ))}
    </Row>
  );
};
