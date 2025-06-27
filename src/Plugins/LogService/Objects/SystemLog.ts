/**
 * SystemLog
 * desc: 系统日志信息，用于记录系统操作的详情
 * @param logID: String (日志的唯一标识)
 * @param operationType: LogOperationType:1050 (操作类型，使用枚举LogOperationType)
 * @param userID: String (操作发起者的用户ID)
 * @param targetID: String (被操作对象的ID)
 * @param timestamp: DateTime (操作发生的时间戳)
 * @param details: String (操作的详细信息描述)
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'

import { LogOperationType } from 'Plugins/LogService/Objects/LogOperationType';


export class SystemLog extends Serializable {
    constructor(
        public  logID: string,
        public  operationType: LogOperationType,
        public  userID: string,
        public  targetID: string,
        public  timestamp: number,
        public  details: string
    ) {
        super()
    }
}


