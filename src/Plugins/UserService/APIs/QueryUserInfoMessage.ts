/**
 * QueryUserInfoMessage
 * desc: 查询用户信息，验证adminToken权限后，返回指定userID的用户信息。
 * @param adminToken: Token (管理员的身份鉴权Token，用于验证访问权限。)
 * @param userID: String (需要查询的用户唯一标识)
 * @return userInfo: UserInfo:1022 (查询到的用户信息，包括用户名、角色、姓名等字段。)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class QueryUserInfoMessage extends TongWenMessage {
    constructor(
        public  adminToken: Token,
        public  userID: string
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10011"
    }
}

