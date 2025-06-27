export enum DailyTimeSlot {
    MorningSlot1 = '早八',
    MorningSlot2 = '早十',
    AfternoonSlot1 = '13:30-15:05',
    AfternoonSlot2 = '15:20-16:55',
    AfternoonSlot3 = '17:05-18:40',
    EveningSlot = '晚课'
}

export const dailyTimeSlotList = Object.values(DailyTimeSlot)

export function getDailyTimeSlot(newType: string): DailyTimeSlot {
    return dailyTimeSlotList.filter(t => t === newType)[0]
}
