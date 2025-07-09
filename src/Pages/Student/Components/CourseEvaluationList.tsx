// CourseEvaluationList.tsx
import React from 'react';
import { List, Avatar, Empty, Spin, Button } from 'antd';
import { BookOutlined, EyeOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { CourseDisplayInfo } from './hooks/useCourseEvaluationData';

const { Text } = Typography;

interface CourseEvaluationListProps {
  courses: CourseDisplayInfo[];
  loading: boolean;
  onViewEvaluations: (courseID: number) => void;
}

export const CourseEvaluationList: React.FC<CourseEvaluationListProps> = ({
  courses,
  loading,
  onViewEvaluations
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Empty description="暂无课程数据" />
    );
  }

  return (
    <List
      dataSource={courses}
      renderItem={(course) => (
        <List.Item
          actions={[
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => onViewEvaluations(course.courseID)}
              style={{ color: '#ff69b4' }}
            >
              查看评价
            </Button>
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar 
                icon={<BookOutlined />} 
                style={{ backgroundColor: '#ff85c0' }}
              />
            }
            title={
              <Text strong style={{ color: '#d81b60' }}>
                {course.courseName}
              </Text>
            }
            description={
              <Text type="secondary">
                {course.teacherName} · {course.semester}
              </Text>
            }
          />
        </List.Item>
      )}
      locale={{ emptyText: '暂无课程数据' }}
      style={{ maxHeight: '400px', overflow: 'auto' }}
    />
  );
};
