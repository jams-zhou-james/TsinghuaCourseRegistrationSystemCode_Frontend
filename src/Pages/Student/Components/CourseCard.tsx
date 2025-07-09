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

interface CourseCardProps {
  courseData: CourseDisplayData;
  canSelectCourse: boolean;
  canPreselectCourse: boolean;
  selectedCourses: CourseDisplayData[];
  preselectedCourses: CourseDisplayData[];
  waitingListCourses?: Array<CourseDisplayData & { rank: number }>;
  semesterPhase?: SemesterPhase | null;
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
  semesterPhase,
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

  // 检查是否在等待列表以及获取排名信息
  let isInWaitingList = false;
  let waitingRank: number | undefined = undefined;
  
  if (waitingListCourses && waitingListCourses.length > 0) {
    const waitingCourse = waitingListCourses.find(
      (waitingCourse) => waitingCourse.courseID === courseData.courseID && 
                      waitingCourse.courseGroupID === courseData.courseGroupID
    );
    
    if (waitingCourse) {
      isInWaitingList = true;
      waitingRank = waitingCourse.rank;
    }
  }

  // 课程容量显示
  const capacityText = isInWaitingList && waitingRank !== undefined 
    ? `候补第${waitingRank}位` 
    : `${courseData.currentStudents}/${courseData.capacity}`;
    
  const isFull = courseData.currentStudents >= courseData.capacity;

  // 移除前端时间冲突检查逻辑 - 全部交由后端API处理并反馈结果

  const handleAction = () => {
    if (isSelected || isPreselected || isInWaitingList) {
      // 根据当前阶段和课程状态确定操作文字
      const isPreselectionPhase = semesterPhase?.currentPhase === Phase.phase1;
      let actionText = '退课';
      let confirmTitle = '确认退课';
      
      if (isPreselected) {
        actionText = '删除预选';
        confirmTitle = '确认删除预选';
      } else if (isInWaitingList) {
        actionText = '退出候补';
        confirmTitle = '确认退出候补';
      }
      
      Modal.confirm({
        title: confirmTitle,
        content: `确定要${actionText}《${courseData.courseName}》吗？`,
        onOk: () => onDropCourse(courseData),
      });
    } else {
      // 移除前端时间冲突检查，直接尝试选课/预选，让后端API处理所有逻辑和冲突判断
      
      if (canSelectCourse) {
        // 不再检查人数是否已满，让后端API处理容量限制和返回相应错误信息
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
    if (isSelected || isPreselected || isInWaitingList) {
      // 根据课程状态确定按钮文字
      let buttonText = '退课';
      
      if (isPreselected) {
        buttonText = '删除预选';
      } else if (isInWaitingList) {
        buttonText = '退出候补';
      }
      
      return (
        <Button 
          type="primary" 
          danger 
          icon={<MinusOutlined />}
          onClick={handleAction}
        >
          {buttonText}
        </Button>
      );
    }

    if (canSelectCourse) {
      // 移除人数限制检查，允许点击已满课程，让后端处理容量逻辑
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
        boxShadow: '0 4px 12px rgba(255, 105, 180, 0.1)',
        width: '100%',
        minWidth: '200px',
        maxWidth: '200px'
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
        <Col span={24}>
          <Space>
            <span style={{ color: '#666' }}>课程编号:</span>
            <Tag color="blue">{courseData.courseID}</Tag>
            <span style={{ color: '#666' }}>学分:</span>
            <Tag color="green">{courseData.credit}</Tag>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <UserOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>教师:</span>
            <span>{courseData.teacher || '未指定'}</span>
          </Space>
        </Col>
        <Col span={24}>
          <Space align="start">
            <ClockCircleOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>时间:</span>
            <div style={{ whiteSpace: 'pre-line' }}>
              {courseData.schedule || '时间待定'}
            </div>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <EnvironmentOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>地点:</span>
            <span>{courseData.location || '地点待定'}</span>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <TeamOutlined style={{ color: '#ff69b4' }} />
            <span style={{ color: '#666' }}>人数:</span>
            <span style={{ color: isFull ? '#ff4d4f' : '#52c41a' }}>
              {capacityText}
            </span>
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
