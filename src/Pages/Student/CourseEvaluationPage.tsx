// src/Pages/Student/CourseEvaluationPage.tsx

export const courseEvaluationPagePath = '/student/course-evaluation';

import React, { useEffect, useCallback } from 'react';
import { Typography, Alert, Spin } from 'antd';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { 
  useEvaluationPageState, 
  useCourseEvaluationData, 
  useCourseEvaluationActions,
  CourseEvaluationTabs
} from './Components';

// API相关导入
import { SubmitCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/SubmitCourseEvaluationMessage';
import { UpdateCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/UpdateCourseEvaluationMessage';
import { DeleteCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/DeleteCourseEvaluationMessage';
import { QueryCourseEvaluationsMessage } from 'Plugins/CourseEvaluationService/APIs/QueryCourseEvaluationsMessage';
import { QueryStudentSelectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentSelectedCoursesMessage';
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { QuerySafeUserInfoByUserIDListMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDListMessage';
import { QueryCourseGroupByIDMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupByIDMessage';
import { QueryCoursesByFilterMessage } from 'Plugins/CourseManagementService/APIs/QueryCoursesByFilterMessage';
import { Rating, getRating } from 'Plugins/CourseEvaluationService/Objects/Rating';
import { CourseEvaluation } from 'Plugins/CourseEvaluationService/Objects/CourseEvaluation';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { PairOfGroupAndCourse } from 'Plugins/CourseManagementService/Objects/PairOfGroupAndCourse';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { DayOfWeek } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod } from 'Plugins/CourseManagementService/Objects/TimePeriod';
import { sendMessage } from 'Plugins/CommonUtils/Send/SendMessage';
import { getUserToken } from 'Globals/GlobalStore';

const { Title, Text } = Typography;

// API调用已迁移到hooks中

export const CourseEvaluationPage: React.FC = () => {
  // 使用页面状态hook
  const {
    userToken,
    userInfo,
    semesterPhase,
    loading: pageLoading,
    error: pageError,
    isAuthenticated,
    isStudent,
    canEvaluate,
    permissionMessage,
    permissionLoading
  } = useEvaluationPageState();

  // 使用数据hook
  const {
    eligibleCourses,
    existingEvaluations,
    allCourses,
    filteredCourses,
    selectedCourseForView,
    courseEvaluations,
    loading: dataLoading,
    searchLoading,
    evaluationsLoading,
    handleCourseSearch,
    handleViewCourseEvaluations,
    getExistingEvaluation
  } = useCourseEvaluationData(userToken, canEvaluate);

  // 定义刷新回调函数
  const refreshDataCallback = useCallback(() => {
    // 刷新评价数据
    if (canEvaluate && selectedCourseForView !== null) {
      console.log('刷新评价数据, courseID:', selectedCourseForView);
      // 重新获取当前查看的课程评价
      handleViewCourseEvaluations(selectedCourseForView);
      
      // 如果有selectCourseForView，说明正在查看某个课程的评价
      // 可能需要刷新该课程的评价列表
    }
  }, [canEvaluate, handleViewCourseEvaluations, selectedCourseForView]);

  // 使用操作hook
  const {
    editingState,
    startEditing,
    cancelEditing,
    updateEditingData,
    saveEvaluation,
    deleteEvaluation: deleteEvaluationHandler,
    refreshEvaluations
  } = useCourseEvaluationActions(userToken, refreshDataCallback);

  // 用户角色
  const userRole: UserRole = UserRole.student;

  // 渲染组件
  if (permissionLoading) {
    return (
      <DefaultLayout role={userRole}>
        <div style={{ 
          padding: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
        }}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>正在检查评价权限...</Text>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!canEvaluate) {
    return (
      <DefaultLayout role={userRole}>
        <div style={{ 
          padding: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ color: '#d81b60', textAlign: 'center', marginBottom: '24px' }}>
              课程评价
            </Title>
            <Alert
              message="暂时无法进行课程评价"
              description={permissionMessage}
              type="warning"
              showIcon
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 182, 216, 0.3)',
                borderRadius: '12px'
              }}
            />
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout role={userRole}>
      <div style={{ 
        padding: '24px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Title level={2} style={{ color: '#d81b60', textAlign: 'center', marginBottom: '24px' }}>
            课程评价中心
          </Title>
          
          <Alert
            message={permissionMessage}
            type="success"
            showIcon
            style={{ 
              marginBottom: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 182, 216, 0.3)',
              borderRadius: '12px'
            }}
          />

          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>正在加载课程数据...</Text>
              </div>
            </div>
          ) : (
            <CourseEvaluationTabs
              eligibleCourses={eligibleCourses}
              existingEvaluations={existingEvaluations}
              filteredCourses={filteredCourses}
              allCourses={allCourses}
              selectedCourseForView={selectedCourseForView}
              courseEvaluations={courseEvaluations}
              loading={dataLoading}
              searchLoading={searchLoading}
              evaluationsLoading={evaluationsLoading}
              editingCourse={editingState.editingCourse}
              editingData={editingState.editingData}
              submitting={editingState.submitting}
              onSearch={handleCourseSearch}
              onViewEvaluations={handleViewCourseEvaluations}
              onStartEdit={startEditing}
              onCancelEdit={cancelEditing}
              onSaveEvaluation={saveEvaluation}
              onDeleteEvaluation={deleteEvaluationHandler}
              onRatingChange={(rating) => updateEditingData(rating, undefined)}
              onFeedbackChange={(feedback) => updateEditingData(undefined, feedback)}
              onReset={() => handleCourseSearch({})}
              getExistingEvaluation={getExistingEvaluation}
            />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CourseEvaluationPage;
