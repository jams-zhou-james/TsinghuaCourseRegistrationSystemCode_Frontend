/**
 * GenerateTokenMessage
 * desc: 为用户生成新Token，用于登录后生成Token的需求
 * @param userID: String (用户的唯一标识，用于生成对应的Token)
 * @return token: Token:1061 (生成的Token实体，包括ID、用户ID和过期时间等信息)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'



export class GenerateTokenMessage extends TongWenMessage {
    constructor(
        public  userID: string
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10015"
    }
}

