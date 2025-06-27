/**
 * GetCourseStatusMessage
 * desc: 查询当前学生的选课状态
 * @param studentToken: Token (学生的Token，用于验证身份的有效性。)
 * @return statuses: StudentCourseStatus:1018 (包含当前学生选课状态的列表，每个状态包含课程ID、学生选课状态等信息。)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class GetCourseStatusMessage extends TongWenMessage {
    constructor(
        public  studentToken: Token
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10013"
    }
}

