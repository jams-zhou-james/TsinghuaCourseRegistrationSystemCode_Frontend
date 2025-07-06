
import { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { QueryCourseGroupAuthorizationReceivedMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupAuthorizationReceivedMessage';
import { CreateCourseGroupMessage } from 'Plugins/CourseManagementService/APIs/CreateCourseGroupMessage';
import { UpdateCourseGroupInfoMessage } from 'Plugins/CourseManagementService/APIs/UpdateCourseGroupInfoMessage';
import { DeleteCourseGroupMessage } from 'Plugins/CourseManagementService/APIs/DeleteCourseGroupMessage';

export function useCourseGroups(userToken: string) {
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载课程组
  const fetchGroups = useCallback(() => {
    setLoading(true);
    new QueryCourseGroupAuthorizationReceivedMessage(userToken).send(
      (groupsInfo: string) => {
        try {
          const arr = JSON.parse(groupsInfo);
          const groupObjs = arr.map((g: any) => new CourseGroup(g.courseGroupID, g.name, g.credit, g.ownerTeacherID, g.authorizedTeachers));
          setGroups(groupObjs);
        } catch (e) {
          message.error('解析课程组失败');
        }
        setLoading(false);
      },
      () => {
        message.error('获取课程组失败');
        setLoading(false);
      }
    );
  }, [userToken]);

  useEffect(() => {
    if (userToken) fetchGroups();
  }, [userToken, fetchGroups]);

  // 新增课程组
  const addGroup = (groupName: string, credits: number, cb?: () => void) => {
    setLoading(true);
    new CreateCourseGroupMessage(userToken, groupName, credits).send(
      (info: string) => {
        try {
          const g = JSON.parse(info);
          const newGroup = new CourseGroup(g.courseGroupID, g.name, g.credit, g.ownerTeacherID, g.authorizedTeachers);
          setGroups(prev => [...prev, newGroup]);
          message.success('添加课程组成功');
          cb && cb();
        } catch (e) { message.error('解析新课程组失败'); }
        setLoading(false);
      },
      () => { message.error('添加课程组失败'); setLoading(false); }
    );
  };

  // 编辑课程组
  const editGroup = (groupID: number, groupName: string, credits: number, cb?: () => void) => {
    setLoading(true);
    new UpdateCourseGroupInfoMessage(userToken, groupID, groupName, credits).send(
      (info: string) => {
        try {
          const g = JSON.parse(info);
          setGroups(prev => prev.map(gg => gg.courseGroupID === g.courseGroupID ? new CourseGroup(g.courseGroupID, g.name, g.credit, g.ownerTeacherID, g.authorizedTeachers) : gg));
          message.success('编辑课程组成功');
          cb && cb();
        } catch (e) { message.error('解析编辑课程组失败'); }
        setLoading(false);
      },
      () => { message.error('编辑课程组失败'); setLoading(false); }
    );
  };

  // 删除课程组
  const deleteGroup = (groupID: number, cb?: () => void) => {
    setLoading(true);
    new DeleteCourseGroupMessage(userToken, groupID).send(
      () => {
        setGroups(prev => prev.filter(g => g.courseGroupID !== groupID));
        message.success('已删除课程组');
        cb && cb();
        setLoading(false);
      },
      () => { message.error('删除课程组失败'); setLoading(false); }
    );
  };

  return {
    groups,
    loading,
    fetchGroups,
    addGroup,
    editGroup,
    deleteGroup,
    setGroups, // 如需手动设置
  };
}
