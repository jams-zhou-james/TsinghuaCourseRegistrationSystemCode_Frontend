// CourseManagementContainer.tsx - 课程管理容器组件
import React from 'react';
import { Row, Col, Card, Spin, Alert } from 'antd';
import { CourseSearchForm } from './CourseSearchForm';
import { CourseList } from './CourseList';
import { MyCoursesTabs } from './MyCoursesTabs';
import { useCourseData } from './hooks/useCourseData';
import { useCourseActions } from './hooks/useCourseActions';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';

interface CourseManagementContainerProps {
  userToken: string;
  semesterPhase: SemesterPhase | null;
}

export const CourseManagementContainer: React.FC<CourseManagementContainerProps> = ({
  userToken,
  semesterPhase
}) => {
  const {
    courses,
    selectedCourses,
    preselectedCourses,
    waitingList,
    loading,
    error,
    fetchCourses,
    refreshData
  } = useCourseData(userToken);

  const {
    handleSelectCourse,
    handlePreselectCourse,
    handleDropCourse
  } = useCourseActions(userToken, semesterPhase, refreshData);

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Row gutter={24}>
        {/* 左侧：课程搜索和列表 */}
        <Col span={16}>
          <Card title="课程搜索" style={{ marginBottom: '20px' }}>
            <CourseSearchForm onSearch={fetchCourses} />
          </Card>
          
          <Card title="课程列表" loading={loading}>
            <CourseList
              courses={courses}
              selectedCourses={selectedCourses}
              preselectedCourses={preselectedCourses}
              semesterPhase={semesterPhase}
              onSelectCourse={handleSelectCourse}
              onPreselectCourse={handlePreselectCourse}
              onDropCourse={handleDropCourse}
            />
          </Card>
        </Col>

        {/* 右侧：我的课程 */}
        <Col span={8}>
          <Card title="我的课程">
            <MyCoursesTabs
              selectedCourses={selectedCourses}
              preselectedCourses={preselectedCourses}
              waitingList={waitingList}
              semesterPhase={semesterPhase}
              onDropCourse={handleDropCourse}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
