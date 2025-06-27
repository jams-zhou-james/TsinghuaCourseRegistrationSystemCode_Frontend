/**
 * QueryCourseEvaluationsMessage
 * desc: 查询课程的所有评价
 * @param userToken: Token (用户的Token，用于身份验证)
 * @param courseID: String (课程的唯一标识)
 * @return evaluations: CourseEvaluation:1066 (课程相关的所有评价记录)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class QueryCourseEvaluationsMessage extends TongWenMessage {
    constructor(
        public  userToken: Token,
        public  courseID: string
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10012"
    }
}

