/**
 * UserInfo
 * desc: 用户信息，包含用户的基本信息和角色
 * @param userID: String (用户的唯一ID)
 * @param username: String (用户名)
 * @param password: String (用户密码)
 * @param role: UserRole:1081 (用户角色)
 * @param name: String (用户的真实姓名)
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'

import { UserRole } from 'Plugins/UserService/Objects/UserRole';


export class UserInfo extends Serializable {
    constructor(
        public  userID: string,
        public  username: string,
        public  password: string,
        public  role: UserRole,
        public  name: string
    ) {
        super()
    }
}


