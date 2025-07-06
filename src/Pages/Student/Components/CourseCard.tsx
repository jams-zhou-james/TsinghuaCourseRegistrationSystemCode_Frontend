// CourseCard.tsx
import React from 'react';
import { Card, Tag, Button, Space, Row, Col, Tooltip, Modal, message } from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  TeamOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';

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

interface CourseCardProps {
  courseData: CourseDisplayData;
  canSelectCourse: boolean;
  canPreselectCourse: boolean;
  selectedCourses: CourseDisplayData[];
  preselectedCourses: CourseDisplayData[];
  waitingListCourses: any[];
  onSelectCourse: (courseData: CourseDisplayData) => void;
  onPreselectCourse: (courseData: CourseDisplayData) => void;
  onDropCourse: (courseData: CourseDisplayData) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  courseData,
  canSelectCourse,
  canPreselectCourse,
  selectedCourses,
  preselectedCourses,
  waitingListCourses,
  onSelectCourse,
  onPreselectCourse,
  onDropCourse
}) => {
  // 检查是否已选择
  const isSelected = selectedCourses.some(
    (selectedCourse) => selectedCourse.courseID === courseData.courseID && 
                       selectedCourse.courseGroupID === courseData.courseGroupID
  );

  // 检查是否已预选
  const isPreselected = preselectedCourses.some(
    (preselectedCourse) => preselectedCourse.courseID === courseData.courseID && 
                          preselectedCourse.courseGroupID === courseData.courseGroupID
  );

  // 检查是否在等待列表
  const isInWaitingList = waitingListCourses.some(
    (waitingCourse) => waitingCourse.courseID === courseData.courseID && 
                      waitingCourse.courseGroupID === courseData.courseGroupID
  );

  // 课程容量显示
  const capacityText = `${courseData.currentStudents}/${courseData.capacity}`;
  const isFull = courseData.currentStudents >= courseData.capacity;

  // 时间冲突检查
  const hasTimeConflict = (newCourse: CourseDisplayData) => {
    const allCourses = [...selectedCourses, ...preselectedCourses];
    return allCourses.some(existingCourse => {
      if (existingCourse.courseID === newCourse.courseID) return false;
      
      const existingSchedule = existingCourse.schedule || '';
      const newSchedule = newCourse.schedule || '';
      
      if (!existingSchedule || !newSchedule) return false;
      
      return existingSchedule === newSchedule;
    });
  };

  const handleAction = () => {
    if (isSelected || isPreselected) {
      Modal.confirm({
        title: '确认退课',
        content: `确定要退选《${courseData.courseName}》吗？`,
        onOk: () => onDropCourse(courseData),
      });
    } else {
      if (hasTimeConflict(courseData)) {
        message.warning('该课程与已选课程时间冲突！');
        return;
      }

      if (canSelectCourse && !isFull) {
        onSelectCourse(courseData);
      } else if (canPreselectCourse) {
        onPreselectCourse(courseData);
      } else {
        message.warning('当前不在选课阶段或预选阶段');
      }
    }
  };

  const getStatusTag = () => {
    if (isSelected) {
      return <Tag color="green" icon={<CheckCircleOutlined />}>已选择</Tag>;
    }
    if (isPreselected) {
      return <Tag color="blue" icon={<ExclamationCircleOutlined />}>已预选</Tag>;
    }
    if (isInWaitingList) {
      return <Tag color="orange" icon={<ClockCircleOutlined />}>等待列表</Tag>;
    }
    return null;
  };

  const getActionButton = () => {
    if (isSelected || isPreselected) {
      return (
        <Button 
          type="primary" 
          danger 
          icon={<MinusOutlined />}
          onClick={handleAction}
        >
          退课
        </Button>
      );
    }

    if (canSelectCourse && !isFull) {
      return (
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAction}
          style={{
            background: 'linear-gradient(90deg, #ff69b4 0%, #ff85c0 100%)',
            border: 'none'
          }}
        >
          选课
        </Button>
      );
    }

    if (canPreselectCourse) {
      return (
        <Button 
          type="default" 
          icon={<PlusOutlined />}
          onClick={handleAction}
        >
          预选
        </Button>
      );
    }

    return (
      <Button disabled>
        不可选择
      </Button>
    );
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        border: '1px solid rgba(255, 182, 216, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 4px 12px rgba(255, 105, 180, 0.1)'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <BookOutlined style={{ color: '#ff69b4', fontSize: 16 }} />
              <span style={{ fontSize: 18, fontWeight: 'bold', color: '#d81b60' }}>
                {courseData.courseName}
              </span>
            </Space>
          </Col>
          <Col>
            {getStatusTag()}
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Space>
            <span style={{ color: '#666' }}>课程编号:</span>
            <Tag color="blue">{courseData.courseID}</Tag>
          </Space>
        </Col>
        <Col span={12}>
          <Space>
            <span style={{ color: '#666' }}>学分:</span>
            <Tag color="green">{courseData.credit}</Tag>
          </Space>
        </Col>
        <Col span={12}>
          <Space>
            <UserOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>教师:</span>
            <span>{courseData.teacher || '未指定'}</span>
          </Space>
        </Col>
        <Col span={12}>
          <Space>
            <TeamOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>人数:</span>
            <span style={{ color: isFull ? '#ff4d4f' : '#52c41a' }}>
              {capacityText}
            </span>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <ClockCircleOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>时间:</span>
            <span>{courseData.schedule || '时间待定'}</span>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <EnvironmentOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>地点:</span>
            <span>{courseData.location || '地点待定'}</span>
          </Space>
        </Col>
      </Row>

      {courseData.introduction && (
        <div style={{ marginBottom: 16 }}>
          <Tooltip title={courseData.introduction}>
            <div style={{ 
              color: '#666', 
              fontSize: 12,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <strong>课程简介:</strong> {courseData.introduction}
            </div>
          </Tooltip>
        </div>
      )}

      <Row justify="center">
        <Col>
          {getActionButton()}
        </Col>
      </Row>
    </Card>
  );
};
