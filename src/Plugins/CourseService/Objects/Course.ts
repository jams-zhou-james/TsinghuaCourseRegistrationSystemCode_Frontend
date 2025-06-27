/**
 * Course
 * desc: 课程信息，包含课程的基本配置和状态信息
 * @param courseID: String (课程的唯一标识)
 * @param groupID: String (课程所属的课程组ID)
 * @param teacherID: String (负责教学的教师ID)
 * @param capacity: Int (课程容量，即最多容纳的学生人数)
 * @param schedule: CourseSchedule:2128 (课程的时间安排)
 * @param studentList: String (已选该课程的学生ID列表)
 * @param waitingList: String (等待选择该课程的学生ID列表)
 * @param location: String (课程的线下教学地点)
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'

import { CourseSchedule } from 'Plugins/CourseService/Objects/CourseSchedule';


export class Course extends Serializable {
    constructor(
        public  courseID: string,
        public  groupID: string,
        public  teacherID: string,
        public  capacity: number,
        public  schedule: CourseSchedule[],
        public  studentList: string[],
        public  waitingList: string[],
        public  location: string
    ) {
        super()
    }
}


