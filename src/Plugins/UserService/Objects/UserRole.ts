export enum UserRole {
    student = '学生',
    teacher = '教师',
    superAdmin = '超级管理员'
}

export const userRoleList = Object.values(UserRole)

export function getUserRole(newType: string): UserRole {
    return userRoleList.filter(t => t === newType)[0]
}
