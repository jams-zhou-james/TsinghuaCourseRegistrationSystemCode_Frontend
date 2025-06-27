/**
 * LoginMessage
 * desc: 验证用户名和密码，生成Token并返回角色
 * @param username: String (用户登录的用户名)
 * @param password: String (用户登录的密码)
 * @return token: Token (生成的用户Token对象，包含Token的细节信息)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'



export class LoginMessage extends TongWenMessage {
    constructor(
        public  username: string,
        public  password: string
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10011"
    }
}

