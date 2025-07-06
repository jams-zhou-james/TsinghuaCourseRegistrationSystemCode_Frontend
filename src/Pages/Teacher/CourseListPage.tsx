import React, { useEffect, useState } from 'react';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { Button, Collapse, message, Tag, Spin } from 'antd';
import CourseGroupPanel from './Components/CourseGroupPanel';
import CourseList from './Components/CourseList';
import CourseGroupModal from './Components/CourseGroupModal';
import CourseModal from './Components/CourseModal';
import AuthTeacherModal from './Components/AuthTeacherModal';
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
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { DayOfWeek, dayOfWeekList } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod, timePeriodList } from 'Plugins/CourseManagementService/Objects/TimePeriod';

// 获取当前用户Token
const userRole: UserRole = UserRole.teacher;

export const teacherCourseListPagePath = '/teacher/course-list';

export const TeacherCourseListPage: React.FC = () => {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [courses, setCourses] = useState<Record<number, CourseInfo[]>>({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{visible: boolean, type: 'group'|'course'|null, mode: 'add'|'edit', groupID?: number, course?: CourseInfo, group?: CourseGroup}>({visible: false, type: null, mode: 'add'});
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
          new QueryCourseGroupAuthorizationReceivedMessage(userToken).send(
            (groupsInfo: string) => {
              try {
                const arr = JSON.parse(groupsInfo);
                console.log("arr:", arr)
                const groupObjs = arr.map((g: any) => new CourseGroup(g.courseGroupID, g.name, g.credit, g.ownerTeacherID, g.authorizedTeachers));
                console.log('groupObjs:', groupObjs)
                setGroups(groupObjs);
                // 查询每个课程组下的课程
                groupObjs.forEach((group: CourseGroup) => {
                  new QueryCoursesByCourseGroupMessage(userToken, group.courseGroupID).send(
                    (coursesInfo: string) => {
                      try {
                        const arr = JSON.parse(coursesInfo);
                        setCourses(prev => ({ ...prev, [group.courseGroupID]: arr.map((c: any) => new CourseInfo(
                          c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize
                        )) }));
                      } catch (e) { /* ignore */ }
                    },
                    () => {
                      console.log(group)
                      console.log(new QueryCoursesByCourseGroupMessage(userToken, group.courseGroupID))}
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
    setModal({ visible: true, type: 'group', mode: 'add' });
  };
  const handleEditGroup = (group: CourseGroup) => {
    setModal({ visible: true, type: 'group', mode: 'edit', group });
  };
  const handleDeleteGroup = (groupID: number) => {
    setLoading(true);
    // DeleteCourseGroupMessage 需传递 { teacherToken, courseGroupID }
    new (require('Plugins/CourseManagementService/APIs/DeleteCourseGroupMessage').DeleteCourseGroupMessage)(userToken, groupID).send(
      (info: string) => {
        message.success('已删除课程组');
        setGroups(groups.filter(g => g.courseGroupID !== groupID));
        setLoading(false);
      },
      () => { message.error('删除课程组失败'); setLoading(false); }
    );
  };
  const handleAddCourse = (groupID: number) => {
    setModal({ visible: true, type: 'course', mode: 'add', groupID });
  };
  const handleEditCourse = (groupID: number, course: CourseInfo) => {
    setModal({ visible: true, type: 'course', mode: 'edit', groupID, course });
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
  // 课程组弹窗确认
  const handleGroupModalOk = (values: { groupName: string; credits: number }) => {
    if (!userInfo) return;
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
    setModal({ visible: false, type: null, mode: 'add' });
  };
  // 课程弹窗确认
  const handleCourseModalOk = (values: { location: string; capacity: number; courseTimes?: { dayOfWeek: DayOfWeek; timePeriod: TimePeriod }[] }) => {
    if (!userInfo) return;
    if (modal.mode === 'add' && modal.groupID) {
      setLoading(true);
      const courseTimes = Array.isArray(values.courseTimes)
        ? values.courseTimes.map((ct: { dayOfWeek: DayOfWeek; timePeriod: TimePeriod }) => new CourseTime(ct.dayOfWeek, ct.timePeriod))
        : [];
      new CreateCourseMessage(userToken, modal.groupID, Number(values.capacity), courseTimes, values.location).send(
        (info: string) => {
          try {
            const c = JSON.parse(info);
            const newCourse = new CourseInfo(c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize);
            setCourses(prev => ({ ...prev, [modal.groupID!]: [...(prev[modal.groupID!] || []), newCourse] }));
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
    setModal({ visible: false, type: null, mode: 'add' });
  };
  const handleModalCancel = () => setModal({ visible: false, type: null, mode: 'add' });
  // 授权老师相关状态
  const [authModal, setAuthModal] = useState<{visible: boolean, group?: CourseGroup}|null>(null);
  const [authTeachers, setAuthTeachers] = useState<number[]>([]);
  // 新增：保存授权老师的用户信息
  const [authTeacherInfos, setAuthTeacherInfos] = useState<SafeUserInfo[]>([]);
  const [authLoading, setAuthLoading] = useState(false);

  // 查询授权老师
  const handleShowAuthTeachers = (group: CourseGroup) => {
    setAuthLoading(true);
    new (require('Plugins/CourseManagementService/APIs/QueryCourseGroupAuthorizedTeachersMessage').QueryCourseGroupAuthorizedTeachersMessage)(userToken, group.courseGroupID).send(
      (info: string) => {
        try {
          const arr = JSON.parse(info);
          setAuthTeachers(arr);
          setAuthModal({visible: true, group});
          // 新增：批量查用户信息
          if (Array.isArray(arr) && arr.length > 0) {
            new (require('Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDListMessage').QuerySafeUserInfoByUserIDListMessage)(arr).send(
              (userInfos: string) => {
                try {
                  const infos = JSON.parse(userInfos).map((u: any) => new SafeUserInfo(u.userID, u.userName, u.accountName, u.role));
                  setAuthTeacherInfos(infos);
                } catch {
                  setAuthTeacherInfos([]);
                }
              },
              () => setAuthTeacherInfos([])
            );
          } else {
            setAuthTeacherInfos([]);
          }
        } catch (e) { message.error('解析授权老师失败'); setAuthTeacherInfos([]); }
        setAuthLoading(false);
      },
      () => { message.error('获取授权老师失败'); setAuthLoading(false); setAuthTeacherInfos([]); }
    );
  };
  // 授权老师
  const handleGrantAuth = (group: CourseGroup, teacherID: number) => {
    setAuthLoading(true);
    new (require('Plugins/CourseManagementService/APIs/GrantCourseGroupAuthorizationMessage').GrantCourseGroupAuthorizationMessage)(userToken, group.courseGroupID, teacherID).send(
      (info: string) => {
        try {
          const arr = JSON.parse(info);
          setAuthTeachers(arr);
          message.success('授权成功');
          // 新增：同步刷新用户信息
          if (Array.isArray(arr) && arr.length > 0) {
            new (require('Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDListMessage').QuerySafeUserInfoByUserIDListMessage)(arr).send(
              (userInfos: string) => {
                try {
                  const infos = JSON.parse(userInfos).map((u: any) => new SafeUserInfo(u.userID, u.userName, u.accountName, u.role));
                  setAuthTeacherInfos(infos);
                } catch {
                  setAuthTeacherInfos([]);
                }
              },
              () => setAuthTeacherInfos([])
            );
          } else {
            setAuthTeacherInfos([]);
          }
        } catch (e) { message.error('授权后解析失败'); setAuthTeacherInfos([]); }
        setAuthLoading(false);
      },
      () => { message.error('授权失败'); setAuthLoading(false); setAuthTeacherInfos([]); }
    );
  };
  // 取消授权
  const handleRevokeAuth = (group: CourseGroup, teacherID: number) => {
    setAuthLoading(true);
    new (require('Plugins/CourseManagementService/APIs/RevokeCourseGroupAuthorizationMessage').RevokeCourseGroupAuthorizationMessage)(userToken, group.courseGroupID, teacherID).send(
      (info: string) => {
        try {
          const arr = JSON.parse(info);
          setAuthTeachers(arr);
          message.success('取消授权成功');
          // 新增：同步刷新用户信息
          if (Array.isArray(arr) && arr.length > 0) {
            new (require('Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDListMessage').QuerySafeUserInfoByUserIDListMessage)(arr).send(
              (userInfos: string) => {
                try {
                  const infos = JSON.parse(userInfos).map((u: any) => new SafeUserInfo(u.userID, u.userName, u.accountName, u.role));
                  setAuthTeacherInfos(infos);
                } catch {
                  setAuthTeacherInfos([]);
                }
              },
              () => setAuthTeacherInfos([])
            );
          } else {
            setAuthTeacherInfos([]);
          }
        } catch (e) { message.error('取消授权后解析失败'); setAuthTeacherInfos([]); }
        setAuthLoading(false);
      },
      () => { message.error('取消授权失败'); setAuthLoading(false); setAuthTeacherInfos([]); }
    );
  };

  // 星期label
  function dayOfWeekLabel(d: DayOfWeek) {
    switch (d) {
      case DayOfWeek.monday: return '周一';
      case DayOfWeek.tuesday: return '周二';
      case DayOfWeek.wednesday: return '周三';
      case DayOfWeek.thursday: return '周四';
      case DayOfWeek.friday: return '周五';
      case DayOfWeek.saturday: return '周六';
      case DayOfWeek.sunday: return '周日';
      default: return d;
    }
  }

  const renderContent = () => (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, color: '#1e40af', fontWeight: 700, margin: 0 }}>课程组管理</h2>
        <Button type="primary" onClick={handleAddGroup} style={{ marginRight: 0 }}>新增课程组</Button>
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
          {groups.map(group => {
            const isOwner = userInfo && group.ownerTeacherID === userInfo.userID;
            return (
              <Collapse.Panel
                header={
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#1e40af' }}>
                    {group.name} <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>(学分: {group.credit})</span>
                    {isOwner && <Tag color="blue" style={{ marginLeft: 8 }}>Owner</Tag>}
                  </span>
                }
                key={group.courseGroupID}
                style={{ marginBottom: 16, borderRadius: 8, border: '1.5px solid #e0e7ef', background: '#f8fafc' }}
              >
                <CourseGroupPanel
                  group={group}
                  courses={courses[group.courseGroupID] || []}
                  isOwner={!!isOwner}
                  userID={userInfo?.userID || 0}
                  onAddCourse={handleAddCourse}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onEditCourse={handleEditCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onShowAuthTeachers={handleShowAuthTeachers}
                />
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </div>
      {/* 课程组弹窗 */}
      <CourseGroupModal
        visible={modal.visible && modal.type === 'group'}
        mode={modal.mode as 'add' | 'edit'}
        loading={loading}
        group={modal.group}
        onOk={handleGroupModalOk}
        onCancel={handleModalCancel}
      />
      {/* 课程弹窗 */}
      <CourseModal
        visible={modal.visible && modal.type === 'course'}
        mode={modal.mode as 'add' | 'edit'}
        loading={loading}
        course={modal.course}
        onOk={handleCourseModalOk}
        onCancel={handleModalCancel}
      />
      {/* 授权老师弹窗 */}
      {authModal?.visible && authModal.group && (
        <AuthTeacherModal
          visible={authModal.visible}
          group={authModal.group}
          authTeachers={authTeachers}
          authTeacherInfos={authTeacherInfos}
          loading={authLoading}
          onGrant={handleGrantAuth}
          onRevoke={handleRevokeAuth}
          onCancel={() => setAuthModal(null)}
        />
      )}
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