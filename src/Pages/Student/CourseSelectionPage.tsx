// CourseSelectionPage.tsx
import React from 'react';
import { 
  Typography, 
  Tabs,
  Tag,
  Space,
  Alert,
  Spin
} from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import WithRoleBasedSidebarLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';

// 组件和hooks导入
import { 
  CourseSearchForm, 
  CourseList, 
  MyCoursesTabs, 
  usePageState,
  useCourseData,
  useCourseActions
} from './Components';

const { Title, Text } = Typography;

export const courseSelectionPagePath = '/student/course-selection';

export const CourseSelectionPage: React.FC = () => {
  const {
    userToken,
    userInfo,
    semesterPhase,
    loading: pageLoading,
    error: pageError,
    isAuthenticated,
    isStudent
  } = usePageState();

  const {
    courses,
    selectedCourses,
    preselectedCourses,
    waitingList,
    loading: dataLoading,
    error: dataError,
    fetchCourses,
    refreshData,
    updateCourseCapacity,
    setCourseCapacity
  } = useCourseData(userToken, semesterPhase);

  const {
    handleSelectCourse,
    handlePreselectCourse,
    handleDropCourse
  } = useCourseActions(userToken, semesterPhase, refreshData, updateCourseCapacity, setCourseCapacity);

  // 权限检查
  if (!isAuthenticated) {
    return (
      <WithRoleBasedSidebarLayout role={UserRole.student}>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Text>请先登录</Text>
        </div>
      </WithRoleBasedSidebarLayout>
    );
  }

  // 页面加载状态
  if (pageLoading) {
    return (
      <WithRoleBasedSidebarLayout role={UserRole.student}>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Spin size="large" tip="正在加载页面..." />
        </div>
      </WithRoleBasedSidebarLayout>
    );
  }

  // 页面错误状态
  if (pageError) {
    return (
      <WithRoleBasedSidebarLayout role={UserRole.student}>
        <Alert
          message="页面加载失败"
          description={pageError}
          type="error"
          showIcon
          style={{ margin: '20px' }}
        />
      </WithRoleBasedSidebarLayout>
    );
  }

  // 获取权限状态
  const canSelectCourse = semesterPhase?.currentPhase === Phase.phase2;
  const canPreselectCourse = semesterPhase?.currentPhase === Phase.phase1;

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

          {/* 数据错误提示 */}
          {dataError && (
            <Alert
              message="数据加载失败"
              description={dataError}
              type="warning"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}

          {/* 主要内容区域 */}
          <Tabs
            defaultActiveKey="all"
            centered
            size="large"
            items={[
              {
                key: 'all',
                label: (
                  <Space>
                    <TeamOutlined />
                    <span>所有课程</span>
                    <Tag color="blue">{courses.length}</Tag>
                  </Space>
                ),
                children: (
                  <>
                    <CourseSearchForm onSearch={fetchCourses} />
                    <Spin spinning={dataLoading}>
                      <CourseList
                        courses={courses}
                        selectedCourses={selectedCourses}
                        preselectedCourses={preselectedCourses}
                        semesterPhase={semesterPhase}
                        onSelectCourse={handleSelectCourse}
                        onPreselectCourse={handlePreselectCourse}
                        onDropCourse={handleDropCourse}
                      />
                    </Spin>
                  </>
                )
              },
              {
                key: 'mycourses',
                label: (
                  <Space>
                    <span>我的课程</span>
                    <Tag color="green">{selectedCourses.length + preselectedCourses.length}</Tag>
                  </Space>
                ),
                children: (
                  <MyCoursesTabs
                    selectedCourses={selectedCourses}
                    preselectedCourses={preselectedCourses}
                    waitingList={waitingList}
                    semesterPhase={semesterPhase}
                    onDropCourse={handleDropCourse}
                  />
                )
              }
            ]}
          />
        </div>
      </div>
    </WithRoleBasedSidebarLayout>
  );
};

export default CourseSelectionPage;