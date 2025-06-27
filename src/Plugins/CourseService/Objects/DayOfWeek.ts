export enum DayOfWeek {
    Sunday = '星期日',
    Monday = '星期一',
    Tuesday = '星期二',
    Wednesday = '星期三',
    Thursday = '星期四',
    Friday = '星期五',
    Saturday = '星期六'
}

export const dayOfWeekList = Object.values(DayOfWeek)

export function getDayOfWeek(newType: string): DayOfWeek {
    return dayOfWeekList.filter(t => t === newType)[0]
}
