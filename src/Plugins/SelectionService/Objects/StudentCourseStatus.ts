/**
 * StudentCourseStatus
 * desc: 学生选课状态
 * @param userID: String (用户ID)
 * @param courseID: String (课程ID)
 * @param status: CourseStatus:1096 (课程状态)
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'

import { CourseStatus } from 'Plugins/SelectionService/Objects/CourseStatus';


export class StudentCourseStatus extends Serializable {
    constructor(
        public  userID: string,
        public  courseID: string,
        public  status: CourseStatus
    ) {
        super()
    }
}


