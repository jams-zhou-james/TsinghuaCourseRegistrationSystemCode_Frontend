export enum SemesterStage {
    courseCreation = '老师开课期',
    preSelection = '预选期',
    mainSelection = '正选期',
    dropCourse = '退课期',
    duringSemester = '学期中（不允许退课、无法评价课程）',
    semesterEnd = '学期结束（可以评价课程）'
}

export const semesterStageList = Object.values(SemesterStage)

export function getSemesterStage(newType: string): SemesterStage {
    return semesterStageList.filter(t => t === newType)[0]
}
