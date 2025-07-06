// MyCoursesTabs.tsx
import React from 'react';
import { Tabs, Card, Row, Col, Empty, Space, Tag, Button, Modal, message } from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined as WaitingIcon,
  DeleteOutlined
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

interface MyCoursesTabsProps {
  selectedCourses: CourseDisplayData[];
  preselectedCourses: CourseDisplayData[];
  waitingListCourses: any[];
  onDropCourse: (courseData: CourseDisplayData) => void;
}

export const MyCoursesTabs: React.FC<MyCoursesTabsProps> = ({
  selectedCourses,
  preselectedCourses,
  waitingListCourses,
  onDropCourse
}) => {
  const renderCourseCard = (course: CourseDisplayData, status: 'selected' | 'preselected' | 'waiting') => {
    const handleDrop = () => {
      Modal.confirm({
        title: '确认退课',
        content: `确定要退选《${course.courseName}》吗？`,
        onOk: () => onDropCourse(course),
      });
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'selected':
          return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        case 'preselected':
          return <ExclamationCircleOutlined style={{ color: '#1890ff' }} />;
        case 'waiting':
          return <WaitingIcon style={{ color: '#faad14' }} />;
        default:
          return null;
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'selected':
          return '已选择';
        case 'preselected':
          return '已预选';
        case 'waiting':
          return '等待列表';
        default:
          return '';
      }
    };

    return (
      <Card
        key={`${course.courseID}-${course.courseGroupID}`}
        hoverable
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255, 182, 216, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
        bodyStyle={{ padding: '16px' }}
        actions={status !== 'waiting' ? [
          <Button 
            key="drop"
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleDrop}
          >
            退课
          </Button>
        ] : []}
      >
        <div style={{ marginBottom: 12 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <BookOutlined style={{ color: '#ff69b4' }} />
                <span style={{ fontSize: 16, fontWeight: 'bold', color: '#d81b60' }}>
                  {course.courseName}
                </span>
              </Space>
            </Col>
            <Col>
              <Space>
                {getStatusIcon()}
                <span style={{ fontSize: 12, color: '#666' }}>{getStatusText()}</span>
              </Space>
            </Col>
          </Row>
        </div>

        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Space>
              <span style={{ color: '#666', fontSize: 12 }}>课程编号:</span>
              <Tag color="blue">{course.courseID}</Tag>
              <span style={{ color: '#666', fontSize: 12 }}>学分:</span>
              <Tag color="green">{course.credit}</Tag>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <UserOutlined style={{ color: '#ff69b4', fontSize: 12 }} />
              <span style={{ color: '#666', fontSize: 12 }}>教师:</span>
              <span style={{ fontSize: 12 }}>{course.teacher || '未指定'}</span>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <ClockCircleOutlined style={{ color: '#ff69b4', fontSize: 12 }} />
              <span style={{ color: '#666', fontSize: 12 }}>时间:</span>
              <span style={{ fontSize: 12 }}>{course.schedule || '时间待定'}</span>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <EnvironmentOutlined style={{ color: '#ff69b4', fontSize: 12 }} />
              <span style={{ color: '#666', fontSize: 12 }}>地点:</span>
              <span style={{ fontSize: 12 }}>{course.location || '地点待定'}</span>
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              <TeamOutlined style={{ color: '#ff69b4', fontSize: 12 }} />
              <span style={{ color: '#666', fontSize: 12 }}>人数:</span>
              <span style={{ fontSize: 12 }}>{course.currentStudents}/{course.capacity}</span>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderEmptyState = (text: string) => (
    <Empty
      description={text}
      style={{
        padding: '50px',
        color: '#999'
      }}
    />
  );

  const tabItems = [
    {
      key: 'selected',
      label: (
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>已选课程</span>
          <Tag color="green">{selectedCourses.length}</Tag>
        </Space>
      ),
      children: selectedCourses.length > 0 ? (
        <Row gutter={[16, 16]}>
          {selectedCourses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`selected-${course.courseID}-${course.courseGroupID}`}>
              {renderCourseCard(course, 'selected')}
            </Col>
          ))}
        </Row>
      ) : renderEmptyState('暂无已选课程'),
    },
    {
      key: 'preselected',
      label: (
        <Space>
          <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
          <span>预选课程</span>
          <Tag color="blue">{preselectedCourses.length}</Tag>
        </Space>
      ),
      children: preselectedCourses.length > 0 ? (
        <Row gutter={[16, 16]}>
          {preselectedCourses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`preselected-${course.courseID}-${course.courseGroupID}`}>
              {renderCourseCard(course, 'preselected')}
            </Col>
          ))}
        </Row>
      ) : renderEmptyState('暂无预选课程'),
    },
    {
      key: 'waiting',
      label: (
        <Space>
          <WaitingIcon style={{ color: '#faad14' }} />
          <span>等待列表</span>
          <Tag color="orange">{waitingListCourses.length}</Tag>
        </Space>
      ),
      children: waitingListCourses.length > 0 ? (
        <Row gutter={[16, 16]}>
          {waitingListCourses.map((course) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`waiting-${course.courseID}-${course.courseGroupID}`}>
              {renderCourseCard(course, 'waiting')}
            </Col>
          ))}
        </Row>
      ) : renderEmptyState('暂无等待列表课程'),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <BookOutlined style={{ color: '#ff69b4' }} />
          <span style={{ color: '#d81b60' }}>我的课程</span>
        </Space>
      }
      style={{
        borderRadius: 12,
        border: '1px solid rgba(255, 182, 216, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <Tabs 
        items={tabItems}
        type="card"
      />
    </Card>
  );
};
