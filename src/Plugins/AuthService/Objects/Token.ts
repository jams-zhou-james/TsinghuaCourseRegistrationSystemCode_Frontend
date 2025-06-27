/**
 * Token
 * desc: 表示用户登录后的认证令牌
 * @param tokenID: String (令牌的唯一标识)
 * @param userID: String (关联的用户ID)
 * @param expiration: DateTime (令牌的过期时间)
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'




export class Token extends Serializable {
    constructor(
        public  tokenID: string,
        public  userID: string,
        public  expiration: number
    ) {
        super()
    }
}


