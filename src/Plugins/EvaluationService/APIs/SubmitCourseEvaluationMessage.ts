/**
 * SubmitCourseEvaluationMessage
 * desc: 提交课程评价
 * @param studentToken: Token:1061 (学生的鉴权Token，用于验证请求的合法性)
 * @param courseID: String (所提交评价的目标课程ID)
 * @param content: String (具体的评价内容，描述课程的优点或需要改进的地方)
 * @return evaluationID: String (生成的课程评价记录ID)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class SubmitCourseEvaluationMessage extends TongWenMessage {
    constructor(
        public  studentToken: Token,
        public  courseID: string,
        public  content: string
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10012"
    }
}

