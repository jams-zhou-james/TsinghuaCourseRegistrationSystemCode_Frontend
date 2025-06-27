/**
 * DropCourseMessage
 * desc: 执行退课操作，并更新课程或Waiting List
 * @param studentToken: Token:1061 (验证学生身份的令牌，用于标识请求合法性)
 * @param courseID: String (所退课程的唯一标识)
 * @return result: String (退课操作的结果信息)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class DropCourseMessage extends TongWenMessage {
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

