import React from 'react';
import { Button, Popconfirm, Tag } from 'antd';
import CourseList from './CourseList';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';

interface CourseGroupPanelProps {
  group: CourseGroup;
  courses: CourseInfo[];
  isOwner: boolean;
  userID: number;
  onAddCourse: (groupID: number) => void;
  onEditGroup: (group: CourseGroup) => void;
  onDeleteGroup: (groupID: number) => void;
  onEditCourse: (groupID: number, course: CourseInfo) => void;
  onDeleteCourse: (groupID: number, courseID: number) => void;
  onShowAuthTeachers: (group: CourseGroup) => void;
}

const CourseGroupPanel: React.FC<CourseGroupPanelProps> = ({
  group,
  courses,
  isOwner,
  userID,
  onAddCourse,
  onEditGroup,
  onDeleteGroup,
  onEditCourse,
  onDeleteCourse,
  onShowAuthTeachers,
}) => (
  <div style={{ marginBottom: 16, borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#f8fafc' }}>
    <div style={{ fontWeight: 700, fontSize: 16, color: '#1e40af', padding: 16 }}>
      {group.name}
      <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500, marginLeft: 8 }}>
        (学分: {group.credit})
      </span>
      {isOwner && <Tag color="blue" style={{ marginLeft: 8 }}>Owner</Tag>}
    </div>
    <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, paddingLeft: 16 }}>
      <Button size="small" onClick={() => onAddCourse(group.courseGroupID)} style={{ background: '#e0e7ef', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 500 }}>新增课程</Button>
      {isOwner && (
        <>
          <Button size="small" onClick={() => onEditGroup(group)} style={{ background: '#f1f5f9', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 500 }}>编辑组</Button>
          <Popconfirm title="确定删除该课程组？" onConfirm={() => onDeleteGroup(group.courseGroupID)}>
            <Button size="small" danger style={{ background: '#fef2f2', color: '#be123c', border: 'none', borderRadius: 6, fontWeight: 500 }}>删除组</Button>
          </Popconfirm>
          <Button size="small" onClick={() => onShowAuthTeachers(group)} style={{ background: '#f1f5f9', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 500 }}>授权老师</Button>
        </>
      )}
    </div>
    <CourseList
      courses={courses}
      userID={userID}
      groupID={group.courseGroupID}
      onEditCourse={onEditCourse}
      onDeleteCourse={onDeleteCourse}
    />
  </div>
);

export default CourseGroupPanel;