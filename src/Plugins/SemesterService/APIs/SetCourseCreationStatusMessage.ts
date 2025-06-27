/**
 * SetCourseCreationStatusMessage
 * desc: 允许或禁止课程开课操作
 * @param adminToken: Token:1061 (管理员的Token，用于验证权限)
 * @param status: Boolean (是否允许课程开课操作)
 * @return result: String (操作结果，返回成功或失败的信息)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class SetCourseCreationStatusMessage extends TongWenMessage {
    constructor(
        public  adminToken: Token,
        public  status: boolean
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10014"
    }
}

