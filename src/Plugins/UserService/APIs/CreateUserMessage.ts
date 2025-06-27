/**
 * CreateUserMessage
 * desc: 验证adminToken，创建新用户记录，用于用户创建的需求
 * @param adminToken: Token (管理员鉴权Token，验证是否具有操作权限)
 * @param username: String (新用户的用户名，必须唯一)
 * @param password: String (新用户的密码，存储时需要加密)
 * @param role: UserRole:1081 (新用户的身份角色，例如学生、教师、超级管理员)
 * @param name: String (新用户的真实姓名)
 * @return result: String (操作的执行结果，成功或失败的信息)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';
import { UserRole } from 'Plugins/UserService/Objects/UserRole';


export class CreateUserMessage extends TongWenMessage {
    constructor(
        public  adminToken: Token,
        public  username: string,
        public  password: string,
        public  role: UserRole,
        public  name: string
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10011"
    }
}

