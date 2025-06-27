/**
 * DeleteUserMessage
 * desc: 验证adminToken，删除指定用户，用于用户删除的需求
 * @param adminToken: Token:1061 (管理员的Token，用于验证操作权限)
 * @param userID: String (需要删除的用户ID)
 * @return result: String (删除操作的结果描述，成功或失败的字符串)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class DeleteUserMessage extends TongWenMessage {
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

