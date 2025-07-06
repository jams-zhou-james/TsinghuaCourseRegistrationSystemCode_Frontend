// useCourseActions.ts - 选课操作逻辑的自定义hook
import { message } from 'antd';
import { SelectCourseMessage } from 'Plugins/CourseSelectionService/APIs/SelectCourseMessage';
import { PreselectCourseMessage } from 'Plugins/CourseSelectionService/APIs/PreselectCourseMessage';
import { DropCourseMessage } from 'Plugins/CourseSelectionService/APIs/DropCourseMessage';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';

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
  onDataRefresh: () => void
) => {
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
          onDataRefresh();
        },
        (error: string) => {
          message.error('预选失败: ' + error);
        }
      );
    } else if (semesterPhase.currentPhase === Phase.phase2) {
      // 正选阶段：调用选课API
      new SelectCourseMessage(userToken, course.courseID).send(
        (response: string) => {
          message.success('选课成功');
          onDataRefresh();
        },
        (error: string) => {
          message.error('选课失败: ' + error);
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
        onDataRefresh();
      },
      (error: string) => {
        message.error('预选失败: ' + error);
      }
    );
  };

  const handleDropCourse = (course: CourseDisplayData) => {
    new DropCourseMessage(userToken, course.courseID).send(
      (response: string) => {
        message.success('退课成功');
        onDataRefresh();
      },
      (error: string) => {
        message.error('退课失败: ' + error);
      }
    );
  };

  return {
    handleSelectCourse,
    handlePreselectCourse,
    handleDropCourse
  };
};
