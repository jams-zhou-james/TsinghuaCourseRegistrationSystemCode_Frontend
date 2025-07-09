// hooks/index.ts - hooks 导出文件
// 课程选择相关hooks
export { useCourseActions } from './useCourseActions';
export { useCourseData } from './useCourseData';
export { usePageState } from './usePageState';
export type { CourseDisplayData } from './useCourseActions';

// 课程评价相关hooks
export { useEvaluationPageState } from './useEvaluationPageState';
export { useCourseEvaluationData } from './useCourseEvaluationData';
export { useCourseEvaluationActions } from './useCourseEvaluationActions';
export type { 
  CourseDisplayInfo, 
  CourseEvaluationData, 
  EditingEvaluation, 
  PublicEvaluationInfo, 
  CourseSearchCriteria 
} from './useCourseEvaluationData';
