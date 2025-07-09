// useCourseActions.ts - 选课操作逻辑的自定义hook
import { message } from 'antd';
import { SelectCourseMessage } from 'Plugins/CourseSelectionService/APIs/SelectCourseMessage';
import { PreselectCourseMessage } from 'Plugins/CourseSelectionService/APIs/PreselectCourseMessage';
import { DropCourseMessage } from 'Plugins/CourseSelectionService/APIs/DropCourseMessage';
import { RemovePreselectedCourseMessage } from 'Plugins/CourseSelectionService/APIs/RemovePreselectedCourseMessage';
import { QueryCourseByIDMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseByIDMessage';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';

export interface CourseDisplayData {
  courseID: number;
  courseName: string;
  teacher: string;
  schedule: string;
  location: string;
  currentStudents: number;
  capacity: number;
  credit: number;
  introduction?: string;
  courseGroupID: number;
  isConflicted: boolean;
}

export const useCourseActions = (
  userToken: string,
  semesterPhase: SemesterPhase | null,
  onDataRefresh: () => void,
  updateCourseCapacity?: (courseID: number, changeAmount: number) => void,
  setCourseCapacity?: (courseID: number, currentStudents: number, capacity: number) => void
) => {
  // 从后端获取最新的课程人数信息
  const refreshCourseCapacity = (courseID: number) => {
    console.log(`开始查询课程 ${courseID} 的最新信息...`);
    
    new QueryCourseByIDMessage(userToken, courseID).send(
      (response: string) => {
        try {
          let courseInfo: CourseInfo;
          if (typeof response === 'string') {
            courseInfo = JSON.parse(response);
          } else {
            courseInfo = response as CourseInfo;
          }
          
          // 使用最新的人数信息更新前端显示
          const latestStudentCount = courseInfo.selectedStudentsSize + courseInfo.preselectedStudentsSize;
          console.log(`课程 ${courseID} 最新人数：${latestStudentCount}/${courseInfo.courseCapacity}`);
          
          // 直接设置最新的人数，不再使用增减逻辑
          if (setCourseCapacity) {
            setCourseCapacity(courseID, latestStudentCount, courseInfo.courseCapacity);
            console.log(`已更新课程 ${courseID} 的显示人数`);
          } else {
            console.warn(`setCourseCapacity 函数未提供，降级到完整数据刷新`);
            onDataRefresh();
          }
          
        } catch (e) {
          console.error(`解析课程${courseID}信息失败:`, e, 'Response:', response);
          // 如果解析失败，触发完整数据刷新
          onDataRefresh();
        }
      },
      (error: string) => {
        console.error(`查询课程${courseID}信息失败:`, error);
        // 如果API调用失败，触发完整数据刷新
        onDataRefresh();
      }
    );
  };
  const handleSelectCourse = async (course: CourseDisplayData) => {
    if (!semesterPhase) {
      message.error('学期阶段信息未加载');
      return;
    }

    if (semesterPhase.currentPhase === Phase.phase1) {
      // 预选阶段：调用预选API
      new PreselectCourseMessage(userToken, course.courseID).send(
        (response: string) => {
          message.success('预选成功');
          // 从后端获取最新的课程人数信息
          refreshCourseCapacity(course.courseID);
          // 同时刷新我的课程数据，确保预选按钮变为删除预选按钮
          onDataRefresh();
        },
        (error: string) => {
          message.error('预选失败: ' + error);
          // 即使预选失败，也要获取最新的课程人数信息
          refreshCourseCapacity(course.courseID);
        }
      );
    } else if (semesterPhase.currentPhase === Phase.phase2) {
      // 正选阶段：调用选课API
      new SelectCourseMessage(userToken, course.courseID).send(
        (response: string) => {
          message.success('选课成功');
          // 从后端获取最新的课程人数信息
          refreshCourseCapacity(course.courseID);
          // 同时刷新我的课程数据，确保选课按钮变为退课按钮
          onDataRefresh();
        },
        (error: string) => {
          message.error('选课失败: ' + error);
          // 即使选课失败，也要获取最新的课程人数信息，因为可能是后端状态变化导致的
          refreshCourseCapacity(course.courseID);
        }
      );
    } else {
      message.error('当前不在选课阶段');
    }
  };

  const handlePreselectCourse = async (course: CourseDisplayData) => {
    new PreselectCourseMessage(userToken, course.courseID).send(
      (response: string) => {
        message.success('预选成功');
        // 从后端获取最新的课程人数信息
        refreshCourseCapacity(course.courseID);
        // 同时刷新我的课程数据，确保预选按钮变为删除预选按钮
        onDataRefresh();
      },
      (error: string) => {
        message.error('预选失败: ' + error);
        // 即使预选失败，也要获取最新的课程人数信息
        refreshCourseCapacity(course.courseID);
      }
    );
  };

  const handleDropCourse = (course: CourseDisplayData) => {
    if (!semesterPhase) {
      message.error('学期阶段信息未加载');
      return;
    }

    if (semesterPhase.currentPhase === Phase.phase1) {
      // 预选阶段：调用删除预选API
      new RemovePreselectedCourseMessage(userToken, course.courseID).send(
        (response: string) => {
          message.success('删除预选成功');
          // 从后端获取最新的课程人数信息
          refreshCourseCapacity(course.courseID);
          // 同时刷新我的课程数据，确保删除预选按钮变为预选按钮
          onDataRefresh();
        },
        (error: string) => {
          message.error('删除预选失败: ' + error);
          // 即使删除预选失败，也要获取最新的课程人数信息
          refreshCourseCapacity(course.courseID);
        }
      );
    } else if (semesterPhase.currentPhase === Phase.phase2) {
      // 正选阶段：调用退课API
      new DropCourseMessage(userToken, course.courseID).send(
        (response: string) => {
          message.success('退课成功');
          // 从后端获取最新的课程人数信息
          refreshCourseCapacity(course.courseID);
          // 同时刷新我的课程数据，确保退课按钮变为选课按钮
          onDataRefresh();
        },
        (error: string) => {
          message.error('退课失败: ' + error);
          // 即使退课失败，也要获取最新的课程人数信息
          refreshCourseCapacity(course.courseID);
        }
      );
    } else {
      message.error('当前不在选课阶段');
    }
  };

  return {
    handleSelectCourse,
    handlePreselectCourse,
    handleDropCourse
  };
};
