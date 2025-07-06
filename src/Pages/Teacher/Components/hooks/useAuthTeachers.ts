
import { useState } from 'react';
import { message } from 'antd';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { QueryCourseGroupAuthorizedTeachersMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupAuthorizedTeachersMessage';
import { GrantCourseGroupAuthorizationMessage } from 'Plugins/CourseManagementService/APIs/GrantCourseGroupAuthorizationMessage';
import { RevokeCourseGroupAuthorizationMessage } from 'Plugins/CourseManagementService/APIs/RevokeCourseGroupAuthorizationMessage';

// 需要批量查用户信息
const QuerySafeUserInfoByUserIDListMessage = require('Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDListMessage').QuerySafeUserInfoByUserIDListMessage;

export function useAuthTeachers(userToken: string) {
  const [authTeachers, setAuthTeachers] = useState<number[]>([]);
  const [authTeacherInfos, setAuthTeacherInfos] = useState<SafeUserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // 查询授权老师
  const fetchAuthTeachers = (group: CourseGroup, cb?: () => void) => {
    setLoading(true);
    new QueryCourseGroupAuthorizedTeachersMessage(userToken, group.courseGroupID).send(
      (info: string) => {
        try {
          const arr = JSON.parse(info);
          setAuthTeachers(arr);
          // 批量查用户信息
          if (Array.isArray(arr) && arr.length > 0) {
            new QuerySafeUserInfoByUserIDListMessage(arr).send(
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
        setLoading(false);
        cb && cb();
      },
      () => { message.error('获取授权老师失败'); setLoading(false); setAuthTeacherInfos([]); cb && cb(); }
    );
  };

  // 授权
  const grantAuth = (group: CourseGroup, teacherID: number, cb?: () => void) => {
    setLoading(true);
    new GrantCourseGroupAuthorizationMessage(userToken, group.courseGroupID, teacherID).send(
      (info: string) => {
        try {
          const arr = JSON.parse(info);
          setAuthTeachers(arr);
          message.success('授权成功');
          // 同步刷新用户信息
          if (Array.isArray(arr) && arr.length > 0) {
            new QuerySafeUserInfoByUserIDListMessage(arr).send(
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
        setLoading(false);
        cb && cb();
      },
      () => { message.error('授权失败'); setLoading(false); setAuthTeacherInfos([]); cb && cb(); }
    );
  };

  // 取消授权
  const revokeAuth = (group: CourseGroup, teacherID: number, cb?: () => void) => {
    setLoading(true);
    new RevokeCourseGroupAuthorizationMessage(userToken, group.courseGroupID, teacherID).send(
      (info: string) => {
        try {
          const arr = JSON.parse(info);
          setAuthTeachers(arr);
          message.success('取消授权成功');
          // 同步刷新用户信息
          if (Array.isArray(arr) && arr.length > 0) {
            new QuerySafeUserInfoByUserIDListMessage(arr).send(
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
        setLoading(false);
        cb && cb();
      },
      () => { message.error('取消授权失败'); setLoading(false); setAuthTeacherInfos([]); cb && cb(); }
    );
  };

  return {
    authTeachers,
    authTeacherInfos,
    loading,
    fetchAuthTeachers,
    grantAuth,
    revokeAuth,
    setAuthTeachers,
    setAuthTeacherInfos,
  };
}
