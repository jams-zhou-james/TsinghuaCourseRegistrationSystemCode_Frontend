/**
 * LogoutMessage
 * desc: 用户登出接口，用于使指定Token失效
 * @param userToken: Token:1061 (用户的Token，用于验证身份并使其失效)
 * @return result: String (登出的结果信息，成功或失败)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class LogoutMessage extends TongWenMessage {
    constructor(
        public  userToken: Token
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10011"
    }
}

