/**
 * UpdateUserInfoMessage
 * desc: 验证adminToken，更新用户信息字段，用于更新用户信息的需求
 * @param adminToken: Token:1061 (管理员的鉴权Token)
 * @param userID: String (需要更新的用户ID)
 * @param keys: String (用户信息需要更新的字段列表)
 * @param values: String (字段对应的新值列表，与keys一一对应)
 * @return result: String (操作结果信息，指示更新是否成功)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class UpdateUserInfoMessage extends TongWenMessage {
    constructor(
        public  adminToken: Token,
        public  userID: string,
        public  keys: string[],
        public  values: string[]
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10011"
    }
}

