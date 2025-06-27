/**
 * SelectCourseMessage
 * desc: 执行选课操作并更新课程或Waiting List
 * @param studentToken: Token:1061 (学生的身份验证令牌，用于校验学生身份及权限)
 * @param courseID: String (选课的课程唯一标识符)
 * @return result: String (选课操作的处理结果状态信息)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class SelectCourseMessage extends TongWenMessage {
    constructor(
        public  studentToken: Token,
        public  courseID: string
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10013"
    }
}

