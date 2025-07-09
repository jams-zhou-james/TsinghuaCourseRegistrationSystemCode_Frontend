// useCourseEvaluationActions.ts - 课程评价操作
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { SubmitCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/SubmitCourseEvaluationMessage';
import { UpdateCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/UpdateCourseEvaluationMessage';
import { DeleteCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/DeleteCourseEvaluationMessage';
import { Rating, getRating } from 'Plugins/CourseEvaluationService/Objects/Rating';
import { sendMessage } from 'Plugins/CommonUtils/Send/SendMessage';

// 编辑状态管理接口
export interface EvaluationEditingState {
  editingCourse: number | null;
  editingData: {
    courseID: number;
    rating: number;
    feedback: string;
  } | null;
  submitting: boolean;
}

// 操作结果接口
export interface UseCourseEvaluationActionsResult {
  // 编辑状态
  editingState: EvaluationEditingState;
  
  // 操作方法
  startEditing: (courseID: number, initialRating?: number, initialFeedback?: string) => void;
  cancelEditing: () => void;
  updateEditingData: (rating?: number, feedback?: string) => void;
  saveEvaluation: () => Promise<boolean>;
  deleteEvaluation: (courseID: number) => Promise<boolean>;
  
  // 刷新回调
  refreshEvaluations: () => void;
}

export const useCourseEvaluationActions = (
  userToken: string,
  refreshCallback: () => void
): UseCourseEvaluationActionsResult => {
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{
    courseID: number;
    rating: number;
    feedback: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 开始编辑评价
  const startEditing = useCallback((courseID: number, initialRating = 0, initialFeedback = '') => {
    setEditingCourse(courseID);
    setEditingData({
      courseID,
      rating: initialRating,
      feedback: initialFeedback
    });
  }, []);

  // 取消编辑
  const cancelEditing = useCallback(() => {
    setEditingCourse(null);
    setEditingData(null);
  }, []);

  // 更新编辑中的数据
  const updateEditingData = useCallback((rating?: number, feedback?: string) => {
    setEditingData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        rating: rating !== undefined ? rating : prev.rating,
        feedback: feedback !== undefined ? feedback : prev.feedback
      };
    });
  }, []);

  // 提交评价
  const submitEvaluation = useCallback(async (courseID: number, rating: number, feedback: string): Promise<boolean> => {
    try {
      const ratingEnum = getRating(rating.toString());
      const message = new SubmitCourseEvaluationMessage(userToken, courseID, ratingEnum, feedback);
      const response = await sendMessage(message, 10000);
      
      if (response.ok) {
        const result = await response.text();
        return result.includes('成功') || result.includes('success');
      }
      return false;
    } catch (error) {
      console.error('提交评价失败:', error);
      return false;
    }
  }, [userToken]);

  // 更新评价
  const updateEvaluation = useCallback(async (courseID: number, rating: number, feedback: string): Promise<boolean> => {
    try {
      const ratingEnum = getRating(rating.toString());
      const message = new UpdateCourseEvaluationMessage(userToken, courseID, ratingEnum, feedback);
      const response = await sendMessage(message, 10000);
      
      if (response.ok) {
        const result = await response.text();
        return result.includes('成功') || result.includes('success');
      }
      return false;
    } catch (error) {
      console.error('更新评价失败:', error);
      return false;
    }
  }, [userToken]);

  // 保存评价（新增或更新）
  const saveEvaluation = useCallback(async (): Promise<boolean> => {
    if (!editingData || editingData.rating === 0) {
      message.warning('请至少给出星级评分');
      return false;
    }

    setSubmitting(true);
    try {
      const { courseID, rating, feedback } = editingData;
      
      // 尝试更新，如果失败则尝试提交新评价
      let success = await updateEvaluation(courseID, rating, feedback);
      
      if (!success) {
        // 可能是新评价，尝试提交
        success = await submitEvaluation(courseID, rating, feedback);
      }

      if (success) {
        message.success('评价保存成功');
        cancelEditing();
        refreshCallback(); // 刷新评价数据
        return true;
      } else {
        message.error('保存评价失败，请重试');
        return false;
      }
    } catch (error) {
      message.error('操作失败，请重试');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [editingData, updateEvaluation, submitEvaluation, cancelEditing, refreshCallback]);

  // 删除评价
  const deleteEvaluation = useCallback(async (courseID: number): Promise<boolean> => {
    try {
      const deleteMsg = new DeleteCourseEvaluationMessage(userToken, courseID);
      const response = await sendMessage(deleteMsg, 10000);
      
      if (response.ok) {
        const result = await response.text();
        const success = result.includes('成功') || result.includes('success');
        
        if (success) {
          message.success('评价删除成功');
          refreshCallback(); // 刷新评价数据
        } else {
          message.error('删除评价失败，请重试');
        }
        
        return success;
      }
      
      message.error('删除评价失败，请重试');
      return false;
    } catch (error) {
      console.error('删除评价失败:', error);
      message.error('删除评价失败，请重试');
      return false;
    }
  }, [userToken, refreshCallback]);

  return {
    editingState: {
      editingCourse,
      editingData,
      submitting
    },
    startEditing,
    cancelEditing,
    updateEditingData,
    saveEvaluation,
    deleteEvaluation,
    refreshEvaluations: refreshCallback
  };
};
