/**
 * CourseSchedule
 * desc: 
 * @param day: DayOfWeek ()
 * @param timeSlot: DailyTimeSlot:2127 ()
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'

import { DayOfWeek } from 'Plugins/CourseService/Objects/DayOfWeek';
import { DailyTimeSlot } from 'Plugins/CourseService/Objects/DailyTimeSlot';


export class CourseSchedule extends Serializable {
    constructor(
        public  day: DayOfWeek,
        public  timeSlot: DailyTimeSlot
    ) {
        super()
    }
}


