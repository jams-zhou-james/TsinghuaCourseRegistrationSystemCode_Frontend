import React, { useEffect, useState } from 'react';
// import { CourseGroup } from 'Plugins/CourseService/Objects/CourseGroup';
// import { Course } from 'Plugins/CourseService/Objects/Course';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { Button, Collapse, List, Modal, Input, Form, Popconfirm, message, Tag } from 'antd';
import WithRoleBasedSidebarLayout from '../../Layouts/WithRoleBasedSidebarLayout';

// WARNING: THIS IS JUST TEMPORARY! TO BE REPLACED WITH ACTUAL COURSE GROUP OBJECTS
export class CourseGroup {
    constructor(
        public  groupID: string,
        public  groupName: string,
        public  credits: number,
        public  ownerID: string,
        public  authorizedTeacherIDs: string[]
    ) {
        
    }
}



// WANRING: THIS IS JUST TEMPORARY! TO BE REPLACED WITH ACTUAL COURSE OBJECTS
class Course {
    constructor(
        public  courseID: string,
        public  groupID: string,
        public  teacherID: string,
        public  capacity: number,
        public  schedule: string[],
        public  studentList: string[],
        public  waitingList: string[],
        public  location: string
    ) {
        
    }
}


// TODO: Replace with real API calls
const mockFetchCourseGroups = async (): Promise<CourseGroup[]> => {
  return [
    new CourseGroup('g1', '数学组', 10, 'owner1', ['teacher1']),
    new CourseGroup('g2', '物理组', 8, 'owner2', ['teacher1', 'teacher2']),
  ];
};


// TODO: 从全局store获取
const userID = 'teacher1'; // 或 'teacher1'
const userRole: UserRole = UserRole.teacher; // 或 UserRole.teacher

export const teacherCourseListPagePath = '/course-list';

export const TeacherCourseListPage: React.FC = () => {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [courses, setCourses] = useState<Record<string, Course[]>>({});
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{visible: boolean, type: 'group'|'course'|null, mode: 'add'|'edit', groupID?: string, course?: Course, group?: CourseGroup}>({visible: false, type: null, mode: 'add'});
  const [form] = Form.useForm();

  // 老师加载课程组和课程
  useEffect(() => {
      setLoading(true);
      mockFetchCourseGroups().then(gs => {
        setGroups(gs.filter(g => g.authorizedTeacherIDs.includes(userID)));
        setLoading(false);
      });
  }, []);



  // 老师端：增删改课程组/课程
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
          const newGroup = new CourseGroup('g'+Date.now(), values.groupName, values.credits, userID, [userID]);
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
          const newCourse = new Course('c'+Date.now(), modal.groupID, userID, values.capacity, [], [], [], values.location);
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

  const renderContent = () => {
  // 渲染
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 mt-8">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700 drop-shadow">我的课程组</h2>
        <Button type="primary" onClick={handleAddGroup} style={{ marginBottom: 24, background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)', border: 'none' }}>添加课程组</Button>
        <Collapse
          activeKey={expanded}
          onChange={keys => setExpanded(Array.isArray(keys) ? keys as string[] : [])}
          className="bg-transparent"
          expandIconPosition="end"
          style={{ background: 'transparent' }}
        >
          {groups.map(group => (
            <Collapse.Panel
              header={<span className="font-semibold text-lg text-purple-800">{group.groupName} <span className="text-purple-400 text-base">(学分: {group.credits})</span></span>}
              key={group.groupID}
              className="bg-white rounded-xl shadow border border-purple-200 mb-4"
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <Button size="small" onClick={() => handleAddCourse(group.groupID)} style={{ background: '#c4b5fd', color: '#6d28d9', border: 'none' }}>添加课程</Button>
                <Button size="small" onClick={() => handleEditGroup(group)} style={{ background: '#ede9fe', color: '#7c3aed', border: 'none' }}>编辑组</Button>
                <Popconfirm title="确定删除该课程组？" onConfirm={() => handleDeleteGroup(group.groupID)}>
                  <Button size="small" danger style={{ background: '#f3e8ff', color: '#a21caf', border: 'none' }}>删除组</Button>
                </Popconfirm>
              </div>
              <List
                bordered
                dataSource={courses[group.groupID] || []}
                locale={{emptyText: '暂无课程'}}
                renderItem={course => (
                  <List.Item
                    className="rounded-lg border border-purple-100 my-2 bg-purple-50"
                    actions={[
                      <Button size="small" onClick={() => handleEditCourse(group.groupID, course)} style={{ background: '#ede9fe', color: '#7c3aed', border: 'none' }}>编辑</Button>,
                      <Popconfirm title="确定删除该课程？" onConfirm={() => handleDeleteCourse(group.groupID, course.courseID)}>
                        <Button size="small" danger style={{ background: '#f3e8ff', color: '#a21caf', border: 'none' }}>删除</Button>
                      </Popconfirm>
                    ]}
                  >
                    <div>
                      <div className="text-purple-900 font-medium">{course.location} <span className="text-purple-400">(容量: {course.capacity})</span></div>
                      <div className="text-purple-700 text-sm">课程ID: {course.courseID}</div>
                      <div className="text-purple-700 text-sm">学生数: {course.studentList.length}</div>
                    </div>
                  </List.Item>
                )}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
        <Modal
          open={modal.visible}
          title={modal.type === 'group' ? (modal.mode === 'add' ? '添加课程组' : '编辑课程组') : (modal.mode === 'add' ? '添加课程' : '编辑课程')}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okButtonProps={{ style: { background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)', border: 'none' } }}
          cancelButtonProps={{ style: { borderColor: '#a78bfa', color: '#7c3aed' } }}
        >
          <Form form={form} layout="vertical">
            {modal.type === 'group' && <>
              <Form.Item name="groupName" label={<span className="text-purple-700">课程组名称</span>} rules={[{ required: true, message: '请输入课程组名称' }]}>
                <Input className="border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl" />
              </Form.Item>
              <Form.Item name="credits" label={<span className="text-purple-700">学分</span>} rules={[{ required: true, message: '请输入学分' }]}>
                <Input type="number" className="border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl" />
              </Form.Item>
            </>}
            {modal.type === 'course' && <>
              <Form.Item name="location" label={<span className="text-purple-700">上课地点</span>} rules={[{ required: true, message: '请输入上课地点' }]}>
                <Input className="border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl" />
              </Form.Item>
              <Form.Item name="capacity" label={<span className="text-purple-700">容量</span>} rules={[{ required: true, message: '请输入容量' }]}>
                <Input type="number" className="border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl" />
              </Form.Item>
            </>}
          </Form>
        </Modal>
      </div>
    </div>
  );
  }
  
  return (
    <WithRoleBasedSidebarLayout role={userRole}>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
        {renderContent()}
      </div>
    </WithRoleBasedSidebarLayout>
  );
};

export default TeacherCourseListPage;