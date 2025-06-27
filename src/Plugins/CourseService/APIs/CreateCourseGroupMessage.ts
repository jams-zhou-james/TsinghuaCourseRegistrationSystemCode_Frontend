/**
 * CreateCourseGroupMessage
 * desc: 创建课程分组
 * @param teacherToken: Token:1061 (教师的Token，用于验证身份)
 * @param groupName: String (课程分组的名称)
 * @param credits: Int (课程分组的学分)
 * @return groupID: String (创建的课程分组的唯一标识符)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class CreateCourseGroupMessage extends TongWenMessage {
    constructor(
        public  teacherToken: Token,
        public  groupName: string,
        public  credits: number
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10016"
    }
}

