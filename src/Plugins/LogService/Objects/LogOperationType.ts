export enum LogOperationType {
    create = '创建',
    read = '查询',
    update = '更新',
    delete = '删除',
    systemControl = '系统配置操作'
}

export const logOperationTypeList = Object.values(LogOperationType)

export function getLogOperationType(newType: string): LogOperationType {
    return logOperationTypeList.filter(t => t === newType)[0]
}
