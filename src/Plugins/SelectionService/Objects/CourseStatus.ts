export enum CourseStatus {
    selected = '选中',
    waiting = '等待中'
}

export const courseStatusList = Object.values(CourseStatus)

export function getCourseStatus(newType: string): CourseStatus {
    return courseStatusList.filter(t => t === newType)[0]
}
