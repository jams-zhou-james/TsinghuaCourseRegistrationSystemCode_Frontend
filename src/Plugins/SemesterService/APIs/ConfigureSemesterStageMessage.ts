/**
 * ConfigureSemesterStageMessage
 * desc: 设置学期流程的阶段和时间节点
 * @param adminToken: Token (用于验证管理员权限的Token)
 * @param semesterStage: SemesterStage:1082 (学期阶段枚举，如开课、选课、退课等)
 * @return result: String (操作结果，返回成功或失败信息)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';
import { SemesterStage } from 'Plugins/SemesterService/Objects/SemesterStage';


export class ConfigureSemesterStageMessage extends TongWenMessage {
    constructor(
        public  adminToken: Token,
        public  semesterStage: SemesterStage
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10014"
    }
}

