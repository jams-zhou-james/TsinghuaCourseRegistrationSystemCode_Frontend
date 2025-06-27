// CourseListPagePath.tsx
import React, { useEffect, useState } from 'react';
import { CourseGroup } from 'Plugins/CourseService/Objects/CourseGroup';
import { Course } from 'Plugins/CourseService/Objects/Course';
import { Button, Collapse, List, Modal, Input, Form, Popconfirm, message } from 'antd';

// TODO: Replace with real API calls
const mockFetchCourseGroups = async (): Promise<CourseGroup[]> => {
  return [
    new CourseGroup('g1', '数学组', 10, 'owner1', ['teacher1']),
    new CourseGroup('g2', '物理组', 8, 'owner2', ['teacher1', 'teacher2']),
  ];
};

const mockFetchCourses = async (groupID: string, teacherID: string): Promise<Course[]> => {
  if (groupID === 'g1') {
    return [
      new Course('c1', 'g1', teacherID, 30, [], [], [], '教室A'),
      new Course('c2', 'g1', teacherID, 25, [], [], [], '教室B'),
    ];
  }
  if (groupID === 'g2') {
    return [
      new Course('c3', 'g2', teacherID, 40, [], [], [], '教室C'),
    ];
  }
  return [];
};

const teacherID = 'teacher1'; // TODO: get from global store

export const courseListPagePath = '/course-list';

const CourseListPagePath: React.FC = () => {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [courses, setCourses] = useState<Record<string, Course[]>>({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{visible: boolean, type: 'group'|'course'|null, mode: 'add'|'edit', groupID?: string, course?: Course, group?: CourseGroup}>({visible: false, type: null, mode: 'add'});
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    mockFetchCourseGroups().then(gs => {
      setGroups(gs.filter(g => g.authorizedTeacherIDs.includes(teacherID)));
      setLoading(false);
    });
  }, []);

  const handleExpand = async (groupID: string) => {
    if (!expanded.includes(groupID)) {
      setLoading(true);
      const cs = await mockFetchCourses(groupID, teacherID);
      setCourses(prev => ({...prev, [groupID]: cs}));
      setLoading(false);
      setExpanded([...expanded, groupID]);
    } else {
      setExpanded(expanded.filter(id => id !== groupID));
    }
  };

  // Add/Edit/Delete handlers (stubs)
  const handleAddGroup = () => {
    setModal({visible: true, type: 'group', mode: 'add'});
    form.resetFields();
  };
  const handleEditGroup = (group: CourseGroup) => {
    setModal({visible: true, type: 'group', mode: 'edit', group});
    form.setFieldsValue({ groupName: group.groupName, credits: group.credits });
  };
  const handleDeleteGroup = (groupID: string) => {
    setGroups(groups.filter(g => g.groupID !== groupID));
    message.success('已删除课程组');
  };
  const handleAddCourse = (groupID: string) => {
    setModal({visible: true, type: 'course', mode: 'add', groupID});
    form.resetFields();
  };
  const handleEditCourse = (groupID: string, course: Course) => {
    setModal({visible: true, type: 'course', mode: 'edit', groupID, course});
    form.setFieldsValue({ location: course.location, capacity: course.capacity });
  };
  const handleDeleteCourse = (groupID: string, courseID: string) => {
    setCourses(prev => ({...prev, [groupID]: prev[groupID].filter(c => c.courseID !== courseID)}));
    message.success('已删除课程');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (modal.type === 'group') {
        if (modal.mode === 'add') {
          const newGroup = new CourseGroup('g'+Date.now(), values.groupName, values.credits, teacherID, [teacherID]);
          setGroups([...groups, newGroup]);
          message.success('添加课程组成功');
        } else if (modal.mode === 'edit' && modal.group) {
          setGroups(groups.map(g =>
            g.groupID === modal.group!.groupID
              ? new CourseGroup(g.groupID, values.groupName, values.credits, g.ownerID, g.authorizedTeacherIDs)
              : g
          ));
          message.success('编辑课程组成功');
        }
      } else if (modal.type === 'course') {
        if (modal.mode === 'add' && modal.groupID) {
          const newCourse = new Course('c'+Date.now(), modal.groupID, teacherID, values.capacity, [], [], [], values.location);
          setCourses(prev => ({...prev, [modal.groupID!]: [...(prev[modal.groupID!]||[]), newCourse]}));
          message.success('添加课程成功');
        } else if (modal.mode === 'edit' && modal.groupID && modal.course) {
          setCourses(prev => ({
            ...prev,
            [modal.groupID!]: prev[modal.groupID!].map(c =>
              c.courseID === modal.course!.courseID
                ? new Course(c.courseID, c.groupID, c.teacherID, values.capacity, c.schedule, c.studentList, c.waitingList, values.location)
                : c
            )
          }));
          message.success('编辑课程成功');
        }
      }
      setModal({visible: false, type: null, mode: 'add'});
    });
  };

  const handleModalCancel = () => setModal({visible: false, type: null, mode: 'add'});

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2>我的课程组</h2>
      <Button type="primary" onClick={handleAddGroup} style={{ marginBottom: 16 }}>添加课程组</Button>
      <Collapse activeKey={expanded} onChange={keys => setExpanded(Array.isArray(keys) ? keys as string[] : [])}>
        {groups.map(group => (
          <Collapse.Panel header={group.groupName + ` (学分: ${group.credits})`} key={group.groupID}>
            <div style={{ marginBottom: 8 }}>
              <Button size="small" onClick={() => handleAddCourse(group.groupID)} style={{ marginRight: 8 }}>添加课程</Button>
              <Button size="small" onClick={() => handleEditGroup(group)} style={{ marginRight: 8 }}>编辑组</Button>
              <Popconfirm title="确定删除该课程组？" onConfirm={() => handleDeleteGroup(group.groupID)}><Button size="small" danger>删除组</Button></Popconfirm>
            </div>
            <List
              bordered
              dataSource={courses[group.groupID] || []}
              locale={{emptyText: '暂无课程'}}
              renderItem={course => (
                <List.Item actions={[
                  <Button size="small" onClick={() => handleEditCourse(group.groupID, course)}>编辑</Button>,
                  <Popconfirm title="确定删除该课程？" onConfirm={() => handleDeleteCourse(group.groupID, course.courseID)}><Button size="small" danger>删除</Button></Popconfirm>
                ]}>
                  <div>{course.location} (容量: {course.capacity})</div>
                </List.Item>
              )}
            />
          </Collapse.Panel>
        ))}
      </Collapse>
      <Modal open={modal.visible} title={modal.type === 'group' ? (modal.mode === 'add' ? '添加课程组' : '编辑课程组') : (modal.mode === 'add' ? '添加课程' : '编辑课程')} onOk={handleModalOk} onCancel={handleModalCancel}>
        <Form form={form} layout="vertical">
          {modal.type === 'group' && <>
            <Form.Item name="groupName" label="课程组名称" rules={[{ required: true, message: '请输入课程组名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="credits" label="学分" rules={[{ required: true, message: '请输入学分' }]}>
              <Input type="number" />
            </Form.Item>
          </>}
          {modal.type === 'course' && <>
            <Form.Item name="location" label="上课地点" rules={[{ required: true, message: '请输入上课地点' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="capacity" label="容量" rules={[{ required: true, message: '请输入容量' }]}>
              <Input type="number" />
            </Form.Item>
          </>}
        </Form>
      </Modal>
    </div>
  );
};

export default CourseListPagePath;
