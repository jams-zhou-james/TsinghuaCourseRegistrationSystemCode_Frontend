// MyCoursesTabs.tsx
import React from 'react';
import { Tabs, Card, Row, Col, Empty, Space, Tag, Button, Modal } from 'antd';
import { 
  BookOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined as WaitingIcon,
  DeleteOutlined
} from '@ant-design/icons';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';

// 通用样式
const styles = {
  card: {
    borderRadius: 12,
    border: '1px solid rgba(255, 182, 216, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)'
  },
  pink: { color: '#ff69b4' },
  darkPink: { color: '#d81b60' },
  smallText: { fontSize: 12 },
  labelText: { color: '#666', fontSize: 12 }
};

// 课程状态配置
const statusConfig = {
  selected: { 
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, 
    text: '已选择', 
    color: 'green',
    actionText: '退课',
    confirmTitle: '确认退课'
  },
  preselected: { 
    icon: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />, 
    text: '已预选', 
    color: 'blue',
    actionText: '删除预选',
    confirmTitle: '确认删除预选'
  },
  waiting: { 
    icon: <WaitingIcon style={{ color: '#faad14' }} />, 
    text: '在waiting list', 
    color: 'orange',
    actionText: '退出等待列表',
    confirmTitle: '确认退出等待列表'
  }
};

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
  waitingList?: Array<CourseDisplayData & { rank: number }>;
  semesterPhase?: SemesterPhase | null;
  onDropCourse: (courseData: CourseDisplayData) => void;
}

export const MyCoursesTabs: React.FC<MyCoursesTabsProps> = ({
  selectedCourses,
  preselectedCourses,
  waitingList = [],
  semesterPhase,
  onDropCourse
}) => {
  // 根据学期阶段决定默认激活的Tab和显示的Tab
  const getDefaultActiveKey = (): string => {
    if (!semesterPhase) return 'selected';
    return semesterPhase.currentPhase === Phase.phase1 ? 'preselected' : 'selected';
  };
  
  // 根据课程状态渲染课程卡片
  const renderCourseCard = (course: CourseDisplayData & { rank?: number }, status: keyof typeof statusConfig) => {
    const { icon, text, color, actionText, confirmTitle } = statusConfig[status];
    
    const handleDrop = () => {
      Modal.confirm({
        title: confirmTitle,
        content: `确定要${actionText}《${course.courseName}》吗？`,
        onOk: () => onDropCourse(course),
      });
    };

    return (
      <Card
        hoverable
        style={styles.card}
        bodyStyle={{ padding: '16px' }}
        actions={[
          <Button key="drop" type="text" danger icon={<DeleteOutlined />} onClick={handleDrop}>
            {actionText}
          </Button>
        ]}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <Space>
              <BookOutlined style={styles.pink} />
              <span style={{ fontSize: 16, fontWeight: 'bold', ...styles.darkPink }}>
                {course.courseName}
              </span>
            </Space>
          </Col>
          <Col>
            <Tag color={color}>
              {icon}
              <span style={{ marginLeft: 4 }}>{text}</span>
            </Tag>
          </Col>
        </Row>

        <CourseDetailRows 
          course={course} 
          status={status} 
        />
      </Card>
    );
  };
  
  // 课程详细信息行组件
  const CourseDetailRows = ({ course, status }: { course: CourseDisplayData & { rank?: number }, status: keyof typeof statusConfig }) => (
    <Row gutter={[8, 8]}>
      <Col span={24}>
        <Space>
          <span style={styles.labelText}>课程编号:</span>
          <Tag color="blue">{course.courseID}</Tag>
          <span style={styles.labelText}>学分:</span>
          <Tag color="green">{course.credit}</Tag>
        </Space>
      </Col>
      <DetailRow icon={<UserOutlined style={styles.pink} />} label="教师:" value={course.teacher || '未指定'} />
      <Col span={24}>
        <Space align="start">
          <ClockCircleOutlined style={styles.pink} />
          <span style={styles.labelText}>时间:</span>
          <div style={{ ...styles.smallText, whiteSpace: 'pre-line' }}>
            {course.schedule || '时间待定'}
          </div>
        </Space>
      </Col>
      <DetailRow icon={<EnvironmentOutlined style={styles.pink} />} label="地点:" value={course.location || '地点待定'} />
      <Col span={24}>
        <Space>
          <TeamOutlined style={styles.pink} />
          <span style={styles.labelText}>人数:</span>
          {status === 'waiting' && course.rank !== undefined ? (
            <span style={{ ...styles.smallText, color: '#faad14', fontWeight: 'bold' }}>
              候补第{course.rank}位
            </span>
          ) : (
            <span style={styles.smallText}>{course.currentStudents}/{course.capacity}</span>
          )}
        </Space>
      </Col>
    </Row>
  );
  
  // 详情行组件
  const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <Col span={24}>
      <Space>
        {icon}
        <span style={styles.labelText}>{label}</span>
        <span style={styles.smallText}>{value}</span>
      </Space>
    </Col>
  );

  // 空状态组件
  const renderEmptyState = (text: string) => (
    <Empty description={text} style={{ padding: '50px', color: '#999' }} />
  );

  // 渲染课程列表
  const renderCourseList = (courses: (CourseDisplayData & { rank?: number })[], status: keyof typeof statusConfig) => (
    courses.length > 0 ? (
      <Row gutter={[16, 16]}>
        {courses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={`${status}-${course.courseID}-${course.courseGroupID}`}>
            {renderCourseCard(course, status)}
          </Col>
        ))}
      </Row>
    ) : renderEmptyState(`暂无${statusConfig[status].text.replace('已', '')}课程`)
  );

  // Tab项定义
  const allTabItems = [
    {
      key: 'selected',
      label: (
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>已选课程</span>
          <Tag color="green">{selectedCourses.length}</Tag>
        </Space>
      ),
      children: renderCourseList(selectedCourses, 'selected')
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
      children: renderCourseList(preselectedCourses, 'preselected')
    },
    {
      key: 'waiting',
      label: (
        <Space>
          <WaitingIcon style={{ color: '#faad14' }} />
          <span>等待列表</span>
          <Tag color="orange">{waitingList.length}</Tag>
        </Space>
      ),
      children: renderCourseList(waitingList, 'waiting')
    }
  ];

  // 根据学期阶段过滤显示的Tab
  const getFilteredTabItems = () => {
    if (!semesterPhase) return allTabItems;
    
    switch (semesterPhase.currentPhase) {
      case Phase.phase1: return allTabItems.filter(tab => tab.key === 'preselected');
      case Phase.phase2: return allTabItems.filter(tab => tab.key === 'selected' || tab.key === 'waiting');
      default: return allTabItems;
    }
  };

  return (
    <Card
      title={<Space><BookOutlined style={styles.pink} /><span style={styles.darkPink}>我的课程</span></Space>}
      style={styles.card}
    >
      <Tabs 
        items={getFilteredTabItems()}
        type="card"
        defaultActiveKey={getDefaultActiveKey()}
      />
    </Card>
  );
};
