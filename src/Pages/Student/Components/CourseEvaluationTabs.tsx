// CourseEvaluationTabs.tsx
import React from 'react';
import { Tabs, Row, Col, Card, Empty, Space } from 'antd';
import { EyeOutlined, StarOutlined, BookOutlined } from '@ant-design/icons';
import { EvaluationSearchForm } from './EvaluationSearchForm';
import { CourseEvaluationList } from './CourseEvaluationList';
import { PublicEvaluationList } from './PublicEvaluationList';
import { CourseEvaluationCard } from './CourseEvaluationCard';
import { 
  CourseDisplayInfo, 
  CourseEvaluationData, 
  CourseSearchCriteria, 
  PublicEvaluationInfo 
} from './hooks/useCourseEvaluationData';

interface CourseEvaluationTabsProps {
  // 数据
  eligibleCourses: CourseDisplayInfo[];
  filteredCourses: CourseDisplayInfo[];
  existingEvaluations: CourseEvaluationData[];
  selectedCourseForView: number | null;
  courseEvaluations: PublicEvaluationInfo[];
  allCourses: CourseDisplayInfo[];
  
  // 状态
  loading: boolean;
  searchLoading: boolean;
  evaluationsLoading: boolean;
  
  // 编辑状态
  editingCourse: number | null;
  editingData: {
    courseID: number;
    rating: number;
    feedback: string;
  } | null;
  submitting: boolean;
  
  // 方法
  onSearch: (criteria: CourseSearchCriteria) => void;
  onReset: () => void;
  onViewEvaluations: (courseID: number) => Promise<void>;
  onStartEdit: (courseID: number, initialRating?: number, initialFeedback?: string) => void;
  onCancelEdit: () => void;
  onRatingChange: (value: number) => void;
  onFeedbackChange: (value: string) => void;
  onSaveEvaluation: () => Promise<boolean>;
  onDeleteEvaluation: (courseID: number) => Promise<boolean>;
  getExistingEvaluation: (courseID: number) => CourseEvaluationData | undefined;
}

export const CourseEvaluationTabs: React.FC<CourseEvaluationTabsProps> = ({
  eligibleCourses,
  filteredCourses,
  existingEvaluations,
  selectedCourseForView,
  courseEvaluations,
  allCourses,
  loading,
  searchLoading,
  evaluationsLoading,
  editingCourse,
  editingData,
  submitting,
  onSearch,
  onReset,
  onViewEvaluations,
  onStartEdit,
  onCancelEdit,
  onRatingChange,
  onFeedbackChange,
  onSaveEvaluation,
  onDeleteEvaluation,
  getExistingEvaluation
}) => {
  // 获取选中的课程信息
  const getSelectedCourse = (): CourseDisplayInfo | null => {
    if (!selectedCourseForView) return null;
    return allCourses.find(course => course.courseID === selectedCourseForView) || null;
  };

  // 渲染课程搜索面板
  const renderCourseSearchPanel = () => (
    <Card
      title={
        <Space>
          <EyeOutlined style={{ color: '#ff69b4' }} />
          <span style={{ color: '#d81b60' }}>课程评价查询</span>
        </Space>
      }
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 182, 216, 0.3)',
        borderRadius: '12px',
        marginBottom: '16px'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <EvaluationSearchForm
        onSearch={onSearch}
        onReset={onReset}
        loading={searchLoading}
      />

      <div style={{ 
        borderTop: '1px solid rgba(255, 182, 216, 0.3)', 
        paddingTop: '16px',
        marginTop: '8px'
      }}>
        <Space style={{ marginBottom: '12px' }}>
          <BookOutlined style={{ color: '#ff69b4' }} />
          <span style={{ color: '#d81b60', fontWeight: 'bold' }}>课程列表</span>
        </Space>
      </div>

      <CourseEvaluationList
        courses={filteredCourses}
        loading={searchLoading}
        onViewEvaluations={onViewEvaluations}
      />
    </Card>
  );

  // 渲染课程评价展示面板
  const renderCourseEvaluationsPanel = () => {
    const selectedCourse = getSelectedCourse();
    
    return (
      <Card
        title={
          selectedCourse ? (
            <Space>
              <BookOutlined style={{ color: '#ff69b4' }} />
              <span style={{ color: '#d81b60' }}>
                {selectedCourse.courseName} - 课程评价
              </span>
            </Space>
          ) : (
            <Space>
              <EyeOutlined style={{ color: '#ff69b4' }} />
              <span style={{ color: '#d81b60' }}>查看课程评价</span>
            </Space>
          )
        }
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 182, 216, 0.3)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <PublicEvaluationList
          selectedCourse={selectedCourse}
          evaluations={courseEvaluations}
          loading={evaluationsLoading}
        />
      </Card>
    );
  };

  // 渲染我的课程评价Tab
  const renderMyEvaluationsTab = () => {
    if (eligibleCourses.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px'
        }}>
          <Empty
            description="您还没有可以评价的课程"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <div>
        <div style={{ 
          marginBottom: 16,
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '8px'
        }}>
          <span style={{ color: '#888' }}>
            您可以评价以下 {eligibleCourses.length} 门课程（包括已退课的课程）
          </span>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '16px'
        }}>
          {eligibleCourses.map(course => {
            const existing = getExistingEvaluation(course.courseID);
            const isEditing = editingCourse === course.courseID;
            
            return (
              <CourseEvaluationCard
                key={course.courseID}
                course={course}
                existingEvaluation={existing}
                isEditing={isEditing}
                editingRating={editingData?.rating}
                editingFeedback={editingData?.feedback}
                submitting={submitting}
                onStartEdit={() => onStartEdit(
                  course.courseID,
                  existing?.rating || 0,
                  existing?.feedback || ''
                )}
                onCancelEdit={onCancelEdit}
                onSaveEvaluation={onSaveEvaluation}
                onDeleteEvaluation={() => onDeleteEvaluation(course.courseID)}
                onRatingChange={onRatingChange}
                onFeedbackChange={onFeedbackChange}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Tabs
      defaultActiveKey="view"
      type="card"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
        padding: '8px'
      }}
      items={[
        {
          key: 'view',
          label: (
            <span style={{ color: '#d81b60', fontWeight: 'bold' }}>
              <EyeOutlined /> 查看课程评价
            </span>
          ),
          children: (
            <Row gutter={16}>
              <Col span={10}>
                {renderCourseSearchPanel()}
              </Col>
              <Col span={14}>
                {renderCourseEvaluationsPanel()}
              </Col>
            </Row>
          )
        },
        {
          key: 'personal',
          label: (
            <span style={{ color: '#d81b60', fontWeight: 'bold' }}>
              <StarOutlined /> 我的课程评价
            </span>
          ),
          children: renderMyEvaluationsTab()
        }
      ]}
    />
  );
};
