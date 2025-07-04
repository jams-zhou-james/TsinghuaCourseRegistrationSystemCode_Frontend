import React, { useEffect, useState } from 'react';
import './CourseTablePage.css';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import WithRoleBasedSidebarLayout from '../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout from '../Layouts/BackgroundLayout';
import { Table, Card, Tag, Spin } from 'antd';

// 定义课程类型
interface Course {
  id: string;
  name: string;       // 课程名称
  teacher: string;    // 教师姓名
  location: string;   // 上课地点
  dayOfWeek: number;  // 星期几 (1-7, 1表示星期一)
  startTime: string;  // 开始时间 (如 "08:00")
  endTime: string;    // 结束时间 (如 "09:35")
}
//QueryStudentPreselectedCoursesMessage
//QueryStudentWaitingListStatusMessage
//QueryStudentSelectedCoursesMessage


// 模拟API获取课表数据
const fetchCourseTable = async (): Promise<Course[]> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 返回模拟数据
  return [
    {
      id: '1',
      name: '高等数学',
      teacher: '张教授',
      location: '教学楼A201',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:35'
    },
    {
      id: '2',
      name: '大学英语',
      teacher: '李老师',
      location: '外语楼105',
      dayOfWeek: 2,
      startTime: '09:50',
      endTime: '12:15'
    },
    {
      id: '3',
      name: '计算机科学导论',
      teacher: '王教授',
      location: '计算机中心302',
      dayOfWeek: 3,
      startTime: '13:30',
      endTime: '15:05'
    },
    {
      id: '4',
      name: '体育',
      teacher: '赵教练',
      location: '体育馆',
      dayOfWeek: 4,
      startTime: '15:20',
      endTime: '16:55'
    },
    {
      id: '5',
      name: '物理实验',
      teacher: '钱教授',
      location: '物理实验室B',
      dayOfWeek: 5,
      startTime: '17:05',
      endTime: '18:40'
    },
    {
      id: '6',
      name: '艺术鉴赏',
      teacher: '孙老师',
      location: '艺术楼101',
      dayOfWeek: 6,
      startTime: '19:20',
      endTime: '21:45'
    },
    {
      id: '7',
      name: '数据结构',
      teacher: '周教授',
      location: '教学楼B305',
      dayOfWeek: 3,
      startTime: '09:50',
      endTime: '12:15'
    },
    {
      id: '8',
      name: '算法设计',
      teacher: '吴教授',
      location: '教学楼B305',
      dayOfWeek: 5,
      startTime: '09:50',
      endTime: '12:15'
    }
  ];
};

// 定义时间段
const timeSlots = [
  { id: 1, name: '第一大节', time: '08:00-09:35' },
  { id: 2, name: '第二大节', time: '09:50-12:15' },
  { id: 3, name: '第三大节', time: '13:30-15:05' },
  { id: 4, name: '第四大节', time: '15:20-16:55' },
  { id: 5, name: '第五大节', time: '17:05-18:40' },
  { id: 6, name: '第六大节', time: '19:20-21:45' }
];

export const courseTablePagePath = '/course-table';

const CourseTablePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseTable = async () => {
      try {
        const data = await fetchCourseTable();
        setCourses(data);
        setLoading(false);
      } catch (err) {
        setError('无法加载课程表数据');
        setLoading(false);
      }
    };

    loadCourseTable();
  }, []);

  // 将课程按星期几和时间段分组
  const getCourseForSlot = (day: number, slotId: number): Course | null => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return null;

    // 简单匹配 - 实际应用中可能需要更精确的时间匹配
    return courses.find(c => 
      c.dayOfWeek === day && 
      c.startTime === slot.time.split('-')[0]
    ) || null;
  };

  // 准备表格数据
  const tableData = timeSlots.map(slot => {
    const rowData: any = {
      key: slot.id,
      timeSlot: slot,
    };
    
    // 为每一天添加课程数据
    [1, 2, 3, 4, 5, 6, 7].forEach(day => {
      const course = getCourseForSlot(day, slot.id);
      rowData[`day${day}`] = course;
    });
    
    return rowData;
  });

  // 渲染课程卡片
  const renderCourseCard = (course: Course | null) => {
    if (!course) {
      return <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d9d9d9' }}>无课程</div>;
    }

    return (
      <Card
        size="small"
        style={{
          margin: 0,
          backgroundColor: '#f0f8ff',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          minHeight: '80px',
          boxShadow: 'none'
        }}
        bodyStyle={{ padding: '8px' }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: '#262626', 
            fontSize: '14px',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {course.name}
          </div>
          <div style={{ 
            color: '#666', 
            fontSize: '12px',
            marginBottom: '2px'
          }}>
            {course.teacher}
          </div>
          <div style={{ 
            color: '#999', 
            fontSize: '11px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {course.location}
          </div>
        </div>
      </Card>
    );
  };

  // 表格列配置
  const columns = [
    {
      title: '时间',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: '12%',
      align: 'center' as const,
      render: (slot: any) => (
        <div style={{ textAlign: 'center', padding: '8px' }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: '#262626',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            {slot.name}
          </div>
          <div style={{ 
            color: '#666', 
            fontSize: '12px'
          }}>
            {slot.time}
          </div>
        </div>
      ),
    },
    {
      title: '星期一',
      dataIndex: 'day1',
      key: 'day1',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期二',
      dataIndex: 'day2',
      key: 'day2',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期三',
      dataIndex: 'day3',
      key: 'day3',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期四',
      dataIndex: 'day4',
      key: 'day4',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期五',
      dataIndex: 'day5',
      key: 'day5',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期六',
      dataIndex: 'day6',
      key: 'day6',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
    {
      title: '星期日',
      dataIndex: 'day7',
      key: 'day7',
      width: '12.5%',
      align: 'center' as const,
      render: (course: Course | null) => renderCourseCard(course),
    },
  ];

  const renderContent = () => (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, color: '#1e40af', fontWeight: 700, margin: 0 }}>课程表</h2>
      </div>
      <div style={{ background: '#fff', borderRadius: 0, padding: 0, minHeight: 400 }}>
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={false}
          bordered
          size="small"
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'course-table-row-even' : 'course-table-row-odd'
          }
          style={{
            backgroundColor: '#fff',
            width: '100%'
          }}
        />
      </div>
    </div>
  );

  return (
    <WithRoleBasedSidebarLayout role={UserRole.student}>
      <BackgroundLayout
        gradient="linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
        contentMaxWidth="90%"
        contentStyle={{ maxWidth: 1200 }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div className="course-table-error">{error}</div>
        ) : (
          renderContent()
        )}
      </BackgroundLayout>
    </WithRoleBasedSidebarLayout>
  );
};

export default CourseTablePage;