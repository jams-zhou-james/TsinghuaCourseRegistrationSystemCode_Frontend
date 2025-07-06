
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { QueryCoursesByCourseGroupMessage } from 'Plugins/CourseManagementService/APIs/QueryCoursesByCourseGroupMessage';
import { CreateCourseMessage } from 'Plugins/CourseManagementService/APIs/CreateCourseMessage';
import { UpdateCourseMessage } from 'Plugins/CourseManagementService/APIs/UpdateCourseMessage';
import { DeleteCourseMessage } from 'Plugins/CourseManagementService/APIs/DeleteCourseMessage';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';

export function useCourses(userToken: string) {
  // 以 groupID 为 key
  const [courses, setCourses] = useState<Record<number, CourseInfo[]>>({});
  const [loading, setLoading] = useState(false);

  // 查询某课程组下的课程
  const fetchCourses = useCallback((groupID: number) => {
    setLoading(true);
    new QueryCoursesByCourseGroupMessage(userToken, groupID).send(
      (coursesInfo: string) => {
        try {
          const arr = JSON.parse(coursesInfo);
          setCourses(prev => ({
            ...prev,
            [groupID]: arr.map((c: any) => new CourseInfo(
              c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize
            ))
          }));
        } catch (e) { message.error('解析课程失败'); }
        setLoading(false);
      },
      () => { message.error('获取课程失败'); setLoading(false); }
    );
  }, [userToken]);

  // 新增课程
  const addCourse = (groupID: number, capacity: number, courseTimes: CourseTime[], location: string, cb?: () => void) => {
    setLoading(true);
    new CreateCourseMessage(userToken, groupID, capacity, courseTimes, location).send(
      (info: string) => {
        try {
          const c = JSON.parse(info);
          const newCourse = new CourseInfo(c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize);
          setCourses(prev => ({ ...prev, [groupID]: [...(prev[groupID] || []), newCourse] }));
          message.success('添加课程成功');
          cb && cb();
        } catch (e) { message.error('解析新课程失败'); }
        setLoading(false);
      },
      () => { message.error('添加课程失败'); setLoading(false); }
    );
  };

  // 编辑课程
  const editCourse = (groupID: number, courseID: number, capacity: number, location: string, cb?: () => void) => {
    setLoading(true);
    new UpdateCourseMessage(userToken, courseID, capacity, location).send(
      (info: string) => {
        try {
          const c = JSON.parse(info);
          setCourses(prev => ({
            ...prev,
            [groupID]: prev[groupID].map(cc => cc.courseID === c.courseID ? new CourseInfo(c.courseID, c.courseCapacity, c.time, c.location, c.courseGroupID, c.teacherID, c.preselectedStudentsSize, c.selectedStudentsSize, c.waitingListSize) : cc)
          }));
          message.success('编辑课程成功');
          cb && cb();
        } catch (e) { message.error('解析编辑课程失败'); }
        setLoading(false);
      },
      () => { message.error('编辑课程失败'); setLoading(false); }
    );
  };

  // 删除课程
  const deleteCourse = (groupID: number, courseID: number, cb?: () => void) => {
    setLoading(true);
    new DeleteCourseMessage(userToken, courseID).send(
      () => {
        setCourses(prev => ({ ...prev, [groupID]: prev[groupID].filter(c => c.courseID !== courseID) }));
        message.success('已删除课程');
        cb && cb();
        setLoading(false);
      },
      () => { message.error('删除课程失败'); setLoading(false); }
    );
  };

  return {
    courses,
    loading,
    fetchCourses,
    addCourse,
    editCourse,
    deleteCourse,
    setCourses, // 如需手动设置
  };
}
