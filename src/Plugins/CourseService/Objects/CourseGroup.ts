/**
 * CourseGroup
 * desc: 课程组信息，包含基础的组名以及相关权限信息
 * @param groupID: String (课程组的唯一标识符)
 * @param groupName: String (课程组的名称)
 * @param credits: Int (课程组的学分)
 * @param ownerID: String (课程组拥有者的用户ID)
 * @param authorizedTeacherIDs: String (被授权管理课程组的教师ID列表)
 */
import { Serializable } from 'Plugins/CommonUtils/Send/Serializable'




export class CourseGroup extends Serializable {
    constructor(
        public  groupID: string,
        public  groupName: string,
        public  credits: number,
        public  ownerID: string,
        public  authorizedTeacherIDs: string[]
    ) {
        super()
    }
}


