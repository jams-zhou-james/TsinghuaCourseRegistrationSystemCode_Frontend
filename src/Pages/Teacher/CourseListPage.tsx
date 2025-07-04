import React, { useEffect, useState } from 'react';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { Button, Collapse, List, Modal, Input, Form, Popconfirm, message, Tag, Select, Spin } from 'antd';
import WithRoleBasedSidebarLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout from '../../Layouts/BackgroundLayout';
import { useUserToken } from 'Globals/GlobalStore';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { QueryOwnCourseGroupsMessage } from 'Plugins/CourseManagementService/APIs/QueryOwnCourseGroupsMessage';
import { QueryCourseGroupAuthorizationReceivedMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupAuthorizationReceivedMessage';
import { QueryCoursesByCourseGroupMessage } from 'Plugins/CourseManagementService/APIs/QueryCoursesByCourseGroupMessage';
import { CreateCourseGroupMessage } from 'Plugins/CourseManagementService/APIs/CreateCourseGroupMessage';
import { UpdateCourseGroupInfoMessage } from 'Plugins/CourseManagementService/APIs/UpdateCourseGroupInfoMessage';
import { DeleteCourseGroupMessage } from 'Plugins/CourseManagementService/APIs/DeleteCourseGroupMessage';
import { CreateCourseMessage } from 'Plugins/CourseManagementService/APIs/CreateCourseMessage';
import { UpdateCourseMessage } from 'Plugins/CourseManagementService/APIs/UpdateCourseMessage';
import { DeleteCourseMessage } from 'Plugins/CourseManagementService/APIs/DeleteCourseMessage';
import { GrantCourseGroupAuthorizationMessage } from 'Plugins/CourseManagementService/APIs/GrantCourseGroupAuthorizationMessage';
import { QueryCourseGroupAuthorizedTeachersMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupAuthorizedTeachersMessage';
import { RevokeCourseGroupAuthorizationMessage } from 'Plugins/CourseManagementService/APIs/RevokeCourseGroupAuthorizationMessage';
import { QuerySafeUserInfoByUserIDMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDMessage';
import { UserRole as UserRoleEnum } from 'Plugins/UserAccountService/Objects/UserRole';

// 获取当前用户Token
const userRole: UserRole = UserRole.teacher;

export const teacherCourseListPagePath = '/teacher/course-list';

export const TeacherCourseListPage: React.FC = () => {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [courses, setCourses] = useState<Record<number, CourseInfo[]>>({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{visible: boolean, type: 'group'|'course'|null, mode: 'add'|'edit', groupID?: number, course?: CourseInfo, group?: CourseGroup}>({visible: false, type: null, mode: 'add'});
  const [form] = Form.useForm();
  const userToken = useUserToken();
  const [userInfo, setUserInfo] = useState<SafeUserInfo | null>(null);

  // 加载用户信息和课程组
  useEffect(() => {
    setLoading(true);
    new QuerySafeUserInfoByTokenMessage(userToken).send(
      (info: string) => {
        try {
          const raw = JSON.parse(info);
          const safeUser = new SafeUserInfo(raw.userID, raw.userName, raw.accountName, raw.role);
          setUserInfo(safeUser);
          new QueryOwnCourseGroupsMessage(userToken).send(
            (groupsInfo: string) => {
              try {
                const arr = JSON.parse(groupsInfo);
                const groupObjs = arr.map((g: any) => new CourseGroup(g.courseGroupID, g.name, g.credit, g.ownerTeacherID, g.authorizedTeachers));
                setGroups(groupObjs);
                // 查询每个课程组下的课程
                groupObjs.forEach((group: CourseGroup) => {
                  new QueryCoursesByCourseGroupMessage(group.courseGroupID).send(
                    (coursesInfo: string) => {
                      try {
                        const arr = JSON.parse(coursesInfo);
                        setCourses(prev => ({ ...prev, [group.courseGroupID]: arr.map((c: any) => new CourseInfo(
                          c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize
                        )) }));
                      } catch (e) { /* ignore */ }
                    },
                    () => {}
                  );
                });
              } catch (e) { message.error('解析课程组失败'); }
              setLoading(false);
            },
            () => { message.error('获取课程组失败'); setLoading(false); }
          );
        } catch (e) { message.error('解析用户信息失败'); setLoading(false); }
      },
      () => { message.error('获取用户信息失败'); setLoading(false); }
    );
  }, [userToken]);

  // 课程组/课程操作
  const handleAddGroup = () => {
    setModal({visible: true, type: 'group', mode: 'add'});
    form.resetFields();
  };
  const handleEditGroup = (group: CourseGroup) => {
    setModal({visible: true, type: 'group', mode: 'edit', group});
    form.setFieldsValue({ groupName: group.name, credits: group.credit });
  };
  const handleDeleteGroup = (groupID: number) => {
    setLoading(true);
    new DeleteCourseGroupMessage(userToken, groupID).send(
      (info: string) => {
        message.success('已删除课程组');
        setGroups(groups.filter(g => g.courseGroupID !== groupID));
        setLoading(false);
      },
      () => { message.error('删除课程组失败'); setLoading(false); }
    );
  };
  const handleAddCourse = (groupID: number) => {
    setModal({visible: true, type: 'course', mode: 'add', groupID});
    form.resetFields();
  };
  const handleEditCourse = (groupID: number, course: CourseInfo) => {
    setModal({visible: true, type: 'course', mode: 'edit', groupID, course});
    form.setFieldsValue({ location: course.location, capacity: course.courseCapacity });
  };
  const handleDeleteCourse = (groupID: number, courseID: number) => {
    setLoading(true);
    new DeleteCourseMessage(userToken, courseID).send(
      (info: string) => {
        message.success('已删除课程');
        setCourses(prev => ({...prev, [groupID]: prev[groupID].filter(c => c.courseID !== courseID)}));
        setLoading(false);
      },
      () => { message.error('删除课程失败'); setLoading(false); }
    );
  };
  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (!userInfo) return;
      if (modal.type === 'group') {
        if (modal.mode === 'add') {
          setLoading(true);
          new CreateCourseGroupMessage(userToken, values.groupName, Number(values.credits)).send(
            (info: string) => {
              try {
                const g = JSON.parse(info);
                const newGroup = new CourseGroup(g.courseGroupID, g.name, g.credit, g.ownerTeacherID, g.authorizedTeachers);
                setGroups([...groups, newGroup]);
                message.success('添加课程组成功');
              } catch (e) { message.error('解析新课程组失败'); }
              setLoading(false);
            },
            () => { message.error('添加课程组失败'); setLoading(false); }
          );
        } else if (modal.mode === 'edit' && modal.group) {
          setLoading(true);
          new UpdateCourseGroupInfoMessage(userToken, modal.group.courseGroupID, values.groupName, Number(values.credits)).send(
            (info: string) => {
              try {
                const g = JSON.parse(info);
                setGroups(groups.map(gg => gg.courseGroupID === g.courseGroupID ? new CourseGroup(g.courseGroupID, g.name, g.credit, g.ownerTeacherID, g.authorizedTeachers) : gg));
                message.success('编辑课程组成功');
              } catch (e) { message.error('解析编辑课程组失败'); }
              setLoading(false);
            },
            () => { message.error('编辑课程组失败'); setLoading(false); }
          );
        }
      } else if (modal.type === 'course') {
        if (modal.mode === 'add' && modal.groupID) {
          setLoading(true);
          new CreateCourseMessage(userToken, modal.groupID, Number(values.capacity), [], values.location).send(
            (info: string) => {
              try {
                const c = JSON.parse(info);
                const newCourse = new CourseInfo(c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize);
                setCourses(prev => ({...prev, [modal.groupID!]: [...(prev[modal.groupID!]||[]), newCourse]}));
                message.success('添加课程成功');
              } catch (e) { message.error('解析新课程失败'); }
              setLoading(false);
            },
            () => { message.error('添加课程失败'); setLoading(false); }
          );
        } else if (modal.mode === 'edit' && modal.groupID && modal.course) {
          setLoading(true);
          new UpdateCourseMessage(userToken, modal.course.courseID, Number(values.capacity), values.location).send(
            (info: string) => {
              try {
                const c = JSON.parse(info);
                setCourses(prev => ({
                  ...prev,
                  [modal.groupID!]: prev[modal.groupID!].map(cc => cc.courseID === c.courseID ? new CourseInfo(c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize) : cc)
                }));
                message.success('编辑课程成功');
              } catch (e) { message.error('解析编辑课程失败'); }
              setLoading(false);
            },
            () => { message.error('编辑课程失败'); setLoading(false); }
          );
        }
      }
      setModal({visible: false, type: null, mode: 'add'});
    });
  };
  const handleModalCancel = () => setModal({visible: false, type: null, mode: 'add'});

  const renderContent = () => (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, color: '#1e40af', fontWeight: 700, margin: 0 }}>课程组管理</h2>
        <Button
          type="primary"
          onClick={handleAddGroup}
          style={{ marginRight: 0 }}
        >
          新增课程组
        </Button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px 0 rgba(124,60,237,0.08)', padding: 32, minHeight: 400 }}>
        <Collapse
          activeKey={expanded}
          onChange={keys => {
            if (Array.isArray(keys)) {
              setExpanded(keys.map(key => Number(key)));
            } else {
              setExpanded(keys ? [Number(keys)] : []);
            }
          }}
          expandIconPosition="end"
          style={{ background: 'transparent' }}
        >
          {groups.map(group => (
            <Collapse.Panel
              header={
                <span style={{ fontWeight: 700, fontSize: 16, color: '#1e40af' }}>
                  {group.name} <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>(学分: {group.credit})</span>
                </span>
              }
              key={group.courseGroupID}
              style={{ marginBottom: 16, borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#f8fafc' }}
            >
              <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Button size="small" onClick={() => handleAddCourse(group.courseGroupID)} style={{ background: '#e0e7ef', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 500 }}>新增课程</Button>
                <Button size="small" onClick={() => handleEditGroup(group)} style={{ background: '#f1f5f9', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 500 }}>编辑组</Button>
                <Popconfirm title="确定删除该课程组？" onConfirm={() => handleDeleteGroup(group.courseGroupID)}>
                  <Button size="small" danger style={{ background: '#fef2f2', color: '#be123c', border: 'none', borderRadius: 6, fontWeight: 500 }}>删除组</Button>
                </Popconfirm>
              </div>
              <List
                bordered
                dataSource={courses[group.courseGroupID] || []}
                locale={{ emptyText: <span style={{ color: '#64748b' }}>暂无课程</span> }}
                style={{ background: '#f8fafc', borderRadius: 8 }}
                renderItem={course => (
                  <List.Item
                    style={{ margin: '8px 0', borderRadius: 8, border: '1px solid #e0e7ef', background: '#fff' }}
                    actions={[
                      <Button size="small" onClick={() => handleEditCourse(group.courseGroupID, course)} style={{ background: '#f1f5f9', color: '#1e40af', border: 'none', borderRadius: 6, fontWeight: 500 }}>编辑</Button>,
                      <Popconfirm title="确定删除该课程？" onConfirm={() => handleDeleteCourse(group.courseGroupID, course.courseID)}>
                        <Button size="small" danger style={{ background: '#fef2f2', color: '#be123c', border: 'none', borderRadius: 6, fontWeight: 500 }}>删除</Button>
                      </Popconfirm>
                    ]}
                  >
                    <div>
                      <div style={{ color: '#1e40af', fontWeight: 600 }}>{course.location} <span style={{ color: '#64748b', fontWeight: 400 }}>(容量: {course.courseCapacity})</span></div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>课程ID: {course.courseID}</div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>预选人数: {course.preselectedStudentsSize}，已选人数: {course.selectedStudentsSize}，候补人数: {course.waitingListSize}</div>
                    </div>
                  </List.Item>
                )}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
      <Modal
        title={modal.type === 'group' ? (modal.mode === 'add' ? '新增课程组' : '编辑课程组') : (modal.mode === 'add' ? '新增课程' : '编辑课程')}
        open={modal.visible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okButtonProps={{ style: { background: '#1e40af', border: 'none' } }}
        cancelButtonProps={{ style: { borderColor: '#1e40af', color: '#1e40af' } }}
      >
        <Form form={form} layout="vertical">
          {modal.type === 'group' && <>
            <Form.Item name="groupName" label={<span style={{ color: '#1e40af' }}>课程组名称</span>} rules={[{ required: true, message: '请输入课程组名称' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="credits" label={<span style={{ color: '#1e40af' }}>学分</span>} rules={[{ required: true, message: '请输入学分' }]}>
              <Input type="number" />
            </Form.Item>
          </>}
          {modal.type === 'course' && <>
            <Form.Item name="location" label={<span style={{ color: '#1e40af' }}>上课地点</span>} rules={[{ required: true, message: '请输入上课地点' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="capacity" label={<span style={{ color: '#1e40af' }}>容量</span>} rules={[{ required: true, message: '请输入容量' }]}>
              <Input type="number" />
            </Form.Item>
          </>}
        </Form>
      </Modal>
    </div>
  );

  return (
    <WithRoleBasedSidebarLayout role={userRole}>
      <BackgroundLayout
        gradient="linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
        contentMaxWidth="90%"
        contentStyle={{ maxWidth: 1200 }}
      >
        {renderContent()}
      </BackgroundLayout>
    </WithRoleBasedSidebarLayout>
  );
};

export default TeacherCourseListPage;