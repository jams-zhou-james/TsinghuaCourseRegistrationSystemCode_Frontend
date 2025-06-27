/**
 * QuerySystemLogMessage
 * desc: 查询系统日志
 * @param adminToken: Token (管理员用于验证操作权限的Token)
 * @param startTime: DateTime (查询日志的起始时间)
 * @param endTime: DateTime (查询日志的结束时间)
 * @param operationTypes: LogOperationType (要筛选的操作类型列表)
 * @return logs: SystemLog:1060 (符合条件的系统日志列表)
 */
import { TongWenMessage } from 'Plugins/TongWenAPI/TongWenMessage'
import { Token } from 'Plugins/AuthService/Objects/Token';
import { LogOperationType } from 'Plugins/LogService/Objects/LogOperationType';


export class QuerySystemLogMessage extends TongWenMessage {
    constructor(
        public  adminToken: Token,
        public  startTime: number,
        public  endTime: number,
        public  operationTypes: LogOperationType[] | null
    ) {
        super()
    }
    getAddress(): string {
        return "127.0.0.1:10014"
    }
}

