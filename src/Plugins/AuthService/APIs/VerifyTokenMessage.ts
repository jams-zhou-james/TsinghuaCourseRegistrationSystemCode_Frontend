/**
 * VerifyTokenMessage
 * desc: 验证指定Token的有效性，用于微服务Token验证需求。
 * @param token: Token:1061 (鉴权Token，用于验证用户身份的有效性。)
 * @return result: Boolean (验证结果，是否有效。)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';


export class VerifyTokenMessage extends TongWenMessage {
    constructor(
        public  token: Token
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10015"
    }
}

