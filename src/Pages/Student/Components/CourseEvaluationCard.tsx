// CourseEvaluationCard.tsx
import React from 'react';
import { Card, Tag, Button, Space, Typography, Rate, Avatar, Popconfirm, Input } from 'antd';
import { 
  BookOutlined, 
  StarOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { CourseDisplayInfo, CourseEvaluationData } from './hooks/useCourseEvaluationData';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface CourseEvaluationCardProps {
  course: CourseDisplayInfo;
  existingEvaluation?: CourseEvaluationData;
  isEditing: boolean;
  editingRating?: number;
  editingFeedback?: string;
  submitting: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEvaluation: () => void;
  onDeleteEvaluation: () => void;
  onRatingChange: (value: number) => void;
  onFeedbackChange: (value: string) => void;
}

export const CourseEvaluationCard: React.FC<CourseEvaluationCardProps> = ({
  course,
  existingEvaluation,
  isEditing,
  editingRating = 0,
  editingFeedback = '',
  submitting,
  onStartEdit,
  onCancelEdit,
  onSaveEvaluation,
  onDeleteEvaluation,
  onRatingChange,
  onFeedbackChange
}) => {
  return (
    <Card
      key={course.courseID}
      className="course-evaluation-card"
      style={{ 
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(255, 105, 180, 0.15)',
        border: '1px solid rgba(255, 182, 216, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        height: 'fit-content'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Avatar 
            icon={<BookOutlined />} 
            style={{ 
              backgroundColor: '#ff69b4',
              color: 'white'
            }} 
          />
          <div>
            <Title level={4} style={{ margin: 0, color: '#d81b60' }}>
              {course.courseName}
            </Title>
            <Text type="secondary">
              {course.teacherName} · {course.semester}
            </Text>
          </div>
        </Space>
      </div>

      {isEditing ? (
        // 编辑模式
        <div>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: '#d81b60' }}>评分：</Text>
            <Rate
              value={editingRating}
              onChange={onRatingChange}
              style={{ 
                fontSize: 24,
                color: '#ffd700',
                marginLeft: 8
              }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: '#d81b60' }}>文字评价：</Text>
            <TextArea
              value={editingFeedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              placeholder="请输入对这门课程的评价..."
              rows={6}
              style={{ 
                marginTop: 8,
                borderColor: '#ffb6d8',
                fontSize: '14px'
              }}
              maxLength={500}
              showCount
            />
          </div>

          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSaveEvaluation}
              loading={submitting}
              style={{
                backgroundColor: '#ff69b4',
                borderColor: '#ff69b4'
              }}
            >
              保存
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={onCancelEdit}
              disabled={submitting}
            >
              取消
            </Button>
          </Space>
        </div>
      ) : (
        // 显示模式
        <div>
          {existingEvaluation ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ color: '#d81b60' }}>我的评分：</Text>
                <Rate
                  disabled
                  value={existingEvaluation.rating}
                  style={{ 
                    fontSize: 20,
                    color: '#ffd700',
                    marginLeft: 8
                  }}
                />
                <Tag color="pink" style={{ marginLeft: 8 }}>
                  {existingEvaluation.rating}分
                </Tag>
              </div>
              
              {existingEvaluation.feedback && (
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ color: '#d81b60' }}>我的评价：</Text>
                  <Paragraph style={{ 
                    marginTop: 8,
                    padding: 12,
                    backgroundColor: 'rgba(255, 182, 216, 0.1)',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 182, 216, 0.3)'
                  }}>
                    {existingEvaluation.feedback}
                  </Paragraph>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  最后更新：{existingEvaluation.lastUpdated?.toLocaleString()}
                </Text>
              </div>

              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={onStartEdit}
                  style={{
                    backgroundColor: '#ff85c0',
                    borderColor: '#ff85c0'
                  }}
                >
                  修改评价
                </Button>
                <Popconfirm
                  title="确定要删除这个评价吗？"
                  onConfirm={onDeleteEvaluation}
                  okText="确定"
                  cancelText="取消"
                  okButtonProps={{
                    style: { backgroundColor: '#ff69b4', borderColor: '#ff69b4' }
                  }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                  >
                    删除评价
                  </Button>
                </Popconfirm>
              </Space>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">您还没有评价过这门课程</Text>
              </div>
              <Button
                type="primary"
                icon={<StarOutlined />}
                onClick={onStartEdit}
                style={{
                  backgroundColor: '#ff69b4',
                  borderColor: '#ff69b4'
                }}
              >
                开始评价
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
};
