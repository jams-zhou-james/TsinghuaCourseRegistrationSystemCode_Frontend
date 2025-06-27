/**
 * CourseEvaluation
 * desc: 课程评价信息
 * @param evaluationID: String (评价的唯一标识符)
 * @param courseID: String (课程的唯一标识符)
 * @param userID: String (用户的唯一标识符)
 * @param content: String (评论内容)
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'




export class CourseEvaluation extends Serializable {
    constructor(
        public  evaluationID: string,
        public  courseID: string,
        public  userID: string,
        public  content: string
    ) {
        super()
    }
}


