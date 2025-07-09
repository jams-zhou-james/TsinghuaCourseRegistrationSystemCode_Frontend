// PublicEvaluationList.tsx
import React from 'react';
import { List, Avatar, Empty, Spin, Rate, Tag, Typography, Space } from 'antd';
import { PublicEvaluationInfo } from './hooks/useCourseEvaluationData';
import { CourseDisplayInfo } from './hooks/useCourseEvaluationData';

const { Text, Paragraph } = Typography;

interface PublicEvaluationListProps {
  selectedCourse: CourseDisplayInfo | null;
  evaluations: PublicEvaluationInfo[];
  loading: boolean;
}

export const PublicEvaluationList: React.FC<PublicEvaluationListProps> = ({
  selectedCourse,
  evaluations,
  loading
}) => {
  if (!selectedCourse) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Empty
          description="请从左侧选择一门课程查看评价"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>正在加载评价数据...</Text>
        </div>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Empty
          description="这门课程还没有任何评价"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        marginBottom: 16,
        padding: '12px',
        backgroundColor: 'rgba(255, 182, 216, 0.1)',
        borderRadius: '8px'
      }}>
        <Text strong style={{ color: '#d81b60' }}>
          {selectedCourse.courseName}
        </Text>
        <br />
        <Text type="secondary">
          {selectedCourse.teacherName} · {selectedCourse.semester}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          共 {evaluations.length} 条评价
        </Text>
      </div>

      <List
        dataSource={evaluations}
        renderItem={(evaluation, index) => (
          <List.Item
            style={{
              padding: '16px',
              marginBottom: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 182, 216, 0.2)'
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: '#ff85c0' }}>
                  {evaluation.evaluatorName.charAt(0)}
                </Avatar>
              }
              title={
                <Space>
                  <Text strong>{evaluation.evaluatorName}</Text>
                  <Rate 
                    disabled 
                    value={evaluation.rating} 
                    style={{ fontSize: '16px', color: '#ffd700' }}
                  />
                  <Tag color="pink">{evaluation.rating}分</Tag>
                </Space>
              }
              description={
                <div style={{ marginTop: '8px' }}>
                  {evaluation.feedback ? (
                    <Paragraph style={{ 
                      margin: 0,
                      padding: '8px',
                      backgroundColor: 'rgba(255, 182, 216, 0.05)',
                      borderRadius: '4px'
                    }}>
                      {evaluation.feedback}
                    </Paragraph>
                  ) : (
                    <Text type="secondary">该同学没有留下文字评价</Text>
                  )}
                  {evaluation.evaluatedAt && (
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        评价时间：{evaluation.evaluatedAt.toLocaleString()}
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        style={{ maxHeight: '500px', overflow: 'auto' }}
      />
    </div>
  );
};
