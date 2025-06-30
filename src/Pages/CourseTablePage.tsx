import React, { useEffect, useState } from 'react';
import './CourseTablePage.css';
import { UserRole } from 'Plugins/UserService/Objects/UserRole';
import WithRoleBasedSidebarLayout from '../Layouts/WithRoleBasedSidebarLayout';

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
  { id: 1, name: '第一节', time: '08:00-09:35' },
  { id: 2, name: '第二节', time: '09:50-12:15' },
  { id: 3, name: '第三节', time: '13:30-15:05' },
  { id: 4, name: '第四节', time: '15:20-16:55' },
  { id: 5, name: '第五节', time: '17:05-18:40' },
  { id: 6, name: '第六节', time: '19:20-21:45' }
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

  if (loading) {
    return <div className="course-table-loading">加载中...</div>;
  }

  if (error) {
    return <div className="course-table-error">{error}</div>;
  }

  const renderContent = () => {
  return (
    <div className="course-table-container">
      <h1 className="course-table-title">课程表</h1>
      <table className="course-table">
        <colgroup>
          <col style={{ width: '10%' }} /> {/* 时间列 */}
          <col style={{ width: '12.85%' }} /> {/* 星期一 */}
          <col style={{ width: '12.85%' }} /> {/* 星期二 */}
          <col style={{ width: '12.85%' }} /> {/* 星期三 */}
          <col style={{ width: '12.85%' }} /> {/* 星期四 */}
          <col style={{ width: '12.85%' }} /> {/* 星期五 */}
          <col style={{ width: '12.85%' }} /> {/* 星期六 */}
          <col style={{ width: '12.85%' }} /> {/* 星期日 */}
        </colgroup>
        <thead>
          <tr>
            <th>时间</th>
            <th>星期一</th>
            <th>星期二</th>
            <th>星期三</th>
            <th>星期四</th>
            <th>星期五</th>
            <th>星期六</th>
            <th>星期日</th>
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(slot => (
            <tr key={slot.id}>
              <td className="time-slot">{slot.time}</td>
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const course = getCourseForSlot(day, slot.id);
                return (
                  <td key={day} className="course-cell">
                    {course ? (
                      <div className="course-info">
                        <div className="course-name">{course.name}</div>
                        <div className="course-teacher">{course.teacher}</div>
                        <div className="course-location">{course.location}</div>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
    return (
    <WithRoleBasedSidebarLayout role={UserRole.student}>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
        {renderContent()}
      </div>
    </WithRoleBasedSidebarLayout>
  );
};

export default CourseTablePage;