import React, { useEffect, useState } from 'react';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { Button, Collapse, message, Tag, Spin } from 'antd';
import CourseGroupPanel from './Components/CourseGroupPanel';
import CourseGroupModal from './Components/CourseGroupModal';
import CourseModal from './Components/CourseModal';
import AuthTeacherModal from './Components/AuthTeacherModal';
import { useCourseGroups } from './Components/hooks/useCourseGroups';
import { useCourses } from './Components/hooks/useCourses';
import { useAuthTeachers } from './Components/hooks/useAuthTeachers';
import WithRoleBasedSidebarLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import BackgroundLayout from '../../Layouts/BackgroundLayout';
import { useUserToken } from 'Globals/GlobalStore';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { DayOfWeek, dayOfWeekList } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod, timePeriodList } from 'Plugins/CourseManagementService/Objects/TimePeriod';

// 获取当前用户Token
const userRole: UserRole = UserRole.teacher;

export const teacherCourseListPagePath = '/teacher/course-list';

export const TeacherCourseListPage: React.FC = () => {
  const [expanded, setExpanded] = useState<number[]>([]);
  const [modal, setModal] = useState<{visible: boolean, type: 'group'|'course'|null, mode: 'add'|'edit', groupID?: number, course?: CourseInfo, group?: CourseGroup}>({visible: false, type: null, mode: 'add'});
  const userToken = useUserToken();
  const [userInfo, setUserInfo] = useState<SafeUserInfo | null>(null);

  // hooks
  const {
    groups,
    loading: groupLoading,
    addGroup,
    editGroup,
    deleteGroup,
    setGroups,
    fetchGroups,
  } = useCourseGroups(userToken);
  const {
    courses,
    loading: courseLoading,
    addCourse,
    editCourse,
    deleteCourse,
    setCourses,
    fetchCourses,
  } = useCourses(userToken);
  const {
    authTeachers,
    authTeacherInfos,
    loading: authLoading,
    fetchAuthTeachers,
    grantAuth,
    revokeAuth,
    setAuthTeachers,
    setAuthTeacherInfos,
  } = useAuthTeachers(userToken);

  // 加载用户信息
  useEffect(() => {
    new QuerySafeUserInfoByTokenMessage(userToken).send(
      (info: string) => {
        try {
          const raw = JSON.parse(info);
          const safeUser = new SafeUserInfo(raw.userID, raw.userName, raw.accountName, raw.role);
          setUserInfo(safeUser);
        } catch (e) { message.error('解析用户信息失败'); }
      },
      () => { message.error('获取用户信息失败'); }
    );
  }, [userToken]);

  // 自动拉取每个课程组下的课程
useEffect(() => {
  if (groups && groups.length > 0) {
    groups.forEach(group => {
      new (require('Plugins/CourseManagementService/APIs/QueryCoursesByCourseGroupMessage').QueryCoursesByCourseGroupMessage)(userToken, group.courseGroupID).send(
        (coursesInfo: string) => {
          try {
            const arr = JSON.parse(coursesInfo);
            setCourses(prev => ({
              ...prev,
              [group.courseGroupID]: arr.map((c: any) => new CourseInfo(
                c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize
              ))
            }));
          } catch (e) { /* ignore */ }
        },
        () => {}
      );
    });
  }
}, [groups, userToken]);

  // 课程组/课程操作
  const handleAddGroup = () => {
    setModal({ visible: true, type: 'group', mode: 'add' });
  };
  const handleEditGroup = (group: CourseGroup) => {
    setModal({ visible: true, type: 'group', mode: 'edit', group });
  };
  const handleDeleteGroup = (groupID: number) => {
    deleteGroup(groupID);
  };
  const handleAddCourse = (groupID: number) => {
    setModal({ visible: true, type: 'course', mode: 'add', groupID });
  };
  const handleEditCourse = (groupID: number, course: CourseInfo) => {
    setModal({ visible: true, type: 'course', mode: 'edit', groupID, course });
  };
  const handleDeleteCourse = (groupID: number, courseID: number) => {
    deleteCourse(groupID, courseID);
  };
  // 课程组弹窗确认
  const handleGroupModalOk = (values: { groupName: string; credits: number }) => {
    if (!userInfo) return;
    if (modal.mode === 'add') {
      addGroup(values.groupName, Number(values.credits), () => setModal({ visible: false, type: null, mode: 'add' }));
    } else if (modal.mode === 'edit' && modal.group) {
      editGroup(modal.group.courseGroupID, values.groupName, Number(values.credits), () => setModal({ visible: false, type: null, mode: 'add' }));
    }
  };
  // 课程弹窗确认
  const handleCourseModalOk = (values: { location: string; capacity: number; courseTimes?: { dayOfWeek: DayOfWeek; timePeriod: TimePeriod }[] }) => {
    if (!userInfo) return;
    if (modal.mode === 'add' && modal.groupID) {
      const courseTimes = Array.isArray(values.courseTimes)
        ? values.courseTimes.map((ct: { dayOfWeek: DayOfWeek; timePeriod: TimePeriod }) => new CourseTime(ct.dayOfWeek, ct.timePeriod))
        : [];
      addCourse(modal.groupID, Number(values.capacity), courseTimes, values.location, () => setModal({ visible: false, type: null, mode: 'add' }));
    } else if (modal.mode === 'edit' && modal.groupID && modal.course) {
      editCourse(modal.groupID, modal.course.courseID, Number(values.capacity), values.location, () => setModal({ visible: false, type: null, mode: 'add' }));
    }
  };
  const handleModalCancel = () => setModal({ visible: false, type: null, mode: 'add' });
  // 授权老师弹窗相关
  const [authModal, setAuthModal] = useState<{visible: boolean, group?: CourseGroup}|null>(null);
  const handleShowAuthTeachers = (group: CourseGroup) => {
    fetchAuthTeachers(group, () => setAuthModal({ visible: true, group }));
  };
  const handleGrantAuth = (group: CourseGroup, teacherID: number) => {
    grantAuth(group, teacherID);
  };
  const handleRevokeAuth = (group: CourseGroup, teacherID: number) => {
    revokeAuth(group, teacherID);
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
            );
          })}
        </Collapse>
      </div>
      {/* 课程组弹窗 */}
      <CourseGroupModal
        visible={modal.visible && modal.type === 'group'}
        mode={modal.mode as 'add' | 'edit'}
        loading={groupLoading}
        group={modal.group}
        onOk={handleGroupModalOk}
        onCancel={handleModalCancel}
      />
      {/* 课程弹窗 */}
      <CourseModal
        visible={modal.visible && modal.type === 'course'}
        mode={modal.mode as 'add' | 'edit'}
        loading={courseLoading}
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