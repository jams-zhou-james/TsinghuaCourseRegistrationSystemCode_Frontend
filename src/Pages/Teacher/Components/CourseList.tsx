
import React from 'react';
import { List, Button, Popconfirm, Tag } from 'antd';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';

interface CourseListProps {
  courses: CourseInfo[];
  userID: number;
  groupID: number;
  onEditCourse: (groupID: number, course: CourseInfo) => void;
  onDeleteCourse: (groupID: number, courseID: number) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  userID,
  groupID,
  onEditCourse,
  onDeleteCourse,
}) => (
  <List
    bordered
    dataSource={courses || []}
    locale={{ emptyText: <span style={{ color: '#64748b' }}>暂无课程</span> }}
    style={{ background: '#f8fafc', borderRadius: 8, margin: 16 }}
    renderItem={course => (
      <List.Item
        style={{ margin: '8px 0', borderRadius: 8, border: '1px solid #e0e7ef', background: '#fff' }}
        actions={[
          <Button size="small" onClick={() => onEditCourse(groupID, course)} style={{ background: '#f1f5f9', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 500 }} disabled={course.teacherID !== userID}>编辑</Button>,
          <Popconfirm title="确定删除该课程？" onConfirm={() => onDeleteCourse(groupID, course.courseID)}>
            <Button size="small" danger style={{ background: '#fef2f2', color: '#be123c', border: 'none', borderRadius: 6, fontWeight: 500 }} disabled={course.teacherID !== userID}>删除</Button>
          </Popconfirm>
        ]}
      >
        <div>
          <div style={{ color: '#1e40af', fontWeight: 600 }}>{course.location} <span style={{ color: '#64748b', fontWeight: 400 }}>(容量: {course.courseCapacity})</span></div>
          <div style={{ color: '#64748b', fontSize: 13 }}>课程ID: {course.courseID}</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>预选人数: {course.preselectedStudentsSize}，已选人数: {course.selectedStudentsSize}，候补人数: {course.waitingListSize}</div>
        </div>
        {course.teacherID === userID && <Tag color="purple" style={{ marginRight: 10 }}>我开的课</Tag>}
      </List.Item>
    )}
  />
);

export default CourseList;
