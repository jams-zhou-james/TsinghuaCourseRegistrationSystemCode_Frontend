/**
 * CreateCourseMessage
 * desc: 创建新课程
 * @param teacherToken: Token (教师Token，用于验证教师身份的合法性)
 * @param groupID: String (课程分组ID，标识课程所属分组)
 * @param schedule: CourseSchedule:2128 (课程时间表，包含课程具体的安排)
 * @param location: String (课程地点，用于指明课程的具体上课地点)
 * @param capacity: Int (课程的学生容量限制)
 * @return courseID: String (创建成功后新的课程ID)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';
import { CourseSchedule } from 'Plugins/CourseService/Objects/CourseSchedule';


export class CreateCourseMessage extends TongWenMessage {
    constructor(
        public  teacherToken: Token,
        public  groupID: string,
        public  schedule: CourseSchedule[],
        public  location: string,
        public  capacity: number
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10016"
    }
}

