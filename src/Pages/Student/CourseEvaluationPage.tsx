// src/Pages/Student/CourseEvaluationPage.tsx

export const courseEvaluationPagePath = '/student/course-evaluation';

import React, { useEffect, useState } from 'react';
import { 
  Card,   Rate,   Input,   Button,   List,   message,   Typography,   Space,   Tag,   Avatar,   Divider,  Alert,  Empty,  Spin,  Modal,  Popconfirm,  Tabs,  Form,  Select,  Row,  Col
} from 'antd';
import { 
  StarOutlined,   EditOutlined,   DeleteOutlined,   SaveOutlined,  CloseOutlined,  BookOutlined,  SearchOutlined,  EyeOutlined
} from '@ant-design/icons';
import DefaultLayout from '../../Layouts/WithRoleBasedSidebarLayout';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';

// API相关导入
import { SubmitCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/SubmitCourseEvaluationMessage';
import { UpdateCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/UpdateCourseEvaluationMessage';
import { DeleteCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/DeleteCourseEvaluationMessage';
import { QueryCourseEvaluationsMessage } from 'Plugins/CourseEvaluationService/APIs/QueryCourseEvaluationsMessage';
import { QueryStudentSelectedCoursesMessage } from 'Plugins/CourseSelectionService/APIs/QueryStudentSelectedCoursesMessage';
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { QuerySafeUserInfoByUserIDListMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByUserIDListMessage';
import { QueryCourseGroupByIDMessage } from 'Plugins/CourseManagementService/APIs/QueryCourseGroupByIDMessage';
import { QueryCoursesByFilterMessage } from 'Plugins/CourseManagementService/APIs/QueryCoursesByFilterMessage';
import { Rating, getRating } from 'Plugins/CourseEvaluationService/Objects/Rating';
import { CourseEvaluation } from 'Plugins/CourseEvaluationService/Objects/CourseEvaluation';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { PairOfGroupAndCourse } from 'Plugins/CourseManagementService/Objects/PairOfGroupAndCourse';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { DayOfWeek } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod } from 'Plugins/CourseManagementService/Objects/TimePeriod';
import { sendMessage } from 'Plugins/CommonUtils/Send/SendMessage';
import { getUserToken } from 'Globals/GlobalStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 课程显示信息（包含基本信息和显示所需的名称）
interface CourseDisplayInfo {
  courseID: number;
  courseName: string;
  teacherName: string;
  semester: string;
  courseGroupID: number;
}

interface CourseEvaluationData {
  courseID: number;
  rating: number;
  feedback: string;
  lastUpdated?: Date;
}

interface EditingEvaluation {
  courseID: number;
  rating: number;
  feedback: string;
}

// 其他同学的评价信息
interface PublicEvaluationInfo {
  evaluatorName: string;
  rating: number;
  feedback: string;
  evaluatedAt?: Date;
}

// 查询课程的搜索条件
interface CourseSearchCriteria {
  courseName?: string;
  teacherName?: string;
  courseGroupID?: number;
}

// API调用函数
const checkPhaseAndPermission = async (): Promise<{ canEvaluate: boolean; message: string }> => {
  try {
    const userToken = getUserToken();
    const message = new QuerySemesterPhaseStatusMessage(userToken);
    const response = await sendMessage(message, 10000);
    
    if (response.ok) {
      const result: SemesterPhase = await response.json();
      const canEvaluate = result.permissions.allowStudentEvaluate;
      const message = `当前处于阶段${result.currentPhase}，${canEvaluate ? '可以' : '不可以'}进行课程评价`;
      return { canEvaluate, message };
    } else {
      throw new Error('API调用失败');
    }
  } catch (error) {
    console.error('检查评价权限失败:', error);
    throw error;
  }
};

const fetchEligibleCourses = async (): Promise<CourseDisplayInfo[]> => {
  try {
    const userToken = getUserToken();
    
    // 获取学生已选课程
    const selectedCoursesMessage = new QueryStudentSelectedCoursesMessage(userToken);
    const selectedCoursesResponse = await sendMessage(selectedCoursesMessage, 10000);
    
    if (!selectedCoursesResponse.ok) {
      throw new Error('获取已选课程失败');
    }
    
    const courseInfos: CourseInfo[] = await selectedCoursesResponse.json();
    
    // 获取课程组信息和教师信息
    const courseGroupIDs = [...new Set(courseInfos.map(course => course.courseGroupID))];
    const teacherIDs = [...new Set(courseInfos.map(course => course.teacherID))];
    
    // 批量获取课程组信息
    const courseGroupPromises = courseGroupIDs.map(async (groupID) => {
      const message = new QueryCourseGroupByIDMessage(userToken, groupID);
      const response = await sendMessage(message, 10000);
      if (response.ok) {
        const courseGroup: CourseGroup = await response.json();
        return { id: groupID, group: courseGroup };
      }
      return null;
    });
    
    const courseGroupResults = await Promise.all(courseGroupPromises);
    const courseGroups = new Map<number, CourseGroup>();
    courseGroupResults.forEach(result => {
      if (result) {
        courseGroups.set(result.id, result.group);
      }
    });
    
    // 批量获取教师信息
    const teachersMessage = new QuerySafeUserInfoByUserIDListMessage(teacherIDs);
    const teachersResponse = await sendMessage(teachersMessage, 10000);
    const teachers = new Map<number, SafeUserInfo>();
    
    if (teachersResponse.ok) {
      const teacherInfos: SafeUserInfo[] = await teachersResponse.json();
      teacherInfos.forEach(teacher => {
        teachers.set(teacher.userID, teacher);
      });
    }
    
    // 组装显示用的课程信息
    const displayCourses: CourseDisplayInfo[] = courseInfos.map(course => ({
      courseID: course.courseID,
      courseName: courseGroups.get(course.courseGroupID)?.name || '未知课程',
      teacherName: teachers.get(course.teacherID)?.userName || '未知教师',
      semester: new Date().getFullYear() + '年度', // 简化处理，实际可能需要从其他API获取
      courseGroupID: course.courseGroupID
    }));
    
    return displayCourses;
  } catch (error) {
    console.error('获取课程信息失败:', error);
    throw error;
  }
};

// 获取所有课程信息（用于查询评价）
const fetchAllCourses = async (): Promise<CourseDisplayInfo[]> => {
  try {
    const userToken = getUserToken();
    
    // 生成完整的时间表（所有天 × 所有时间段）
    const allTimeSlots: CourseTime[] = [];
    const allDays = Object.values(DayOfWeek);
    const allTimePeriods = Object.values(TimePeriod);
    
    for (const day of allDays) {
      for (const period of allTimePeriods) {
        allTimeSlots.push(new CourseTime(day, period));
      }
    }
    
    console.log('生成的完整时间表:', allTimeSlots.length, '个时间段');
    console.log('时间表示例:', allTimeSlots.slice(0, 3));
    
    // 使用QueryCoursesByFilterMessage获取所有课程，传入完整时间表
    const message = new QueryCoursesByFilterMessage(
      userToken,
      null, // courseGroupID
      null, // courseGroupName  
      null, // teacherName
      allTimeSlots // 传入完整时间表，表示所有时间都可用
    );
    
    console.log('发送查询所有课程请求:', message);
    
    const response = await sendMessage(message, 10000);
    
    if (!response.ok) {
      console.error('API响应失败:', response.status, response.statusText);
      throw new Error('获取所有课程失败');
    }
    
    const pairs: PairOfGroupAndCourse[] = await response.json();
    console.log('API返回的原始课程数据:', pairs);
    console.log('返回的课程数量:', pairs.length);
    
    // 打印前几个课程的详细信息
    if (pairs.length > 0) {
      console.log('前3个课程详情:', pairs.slice(0, 3).map(pair => ({
        courseID: pair.Course.courseID,
        courseName: pair.CourseGroup.name,
        teacherID: pair.Course.teacherID,
        courseGroupID: pair.CourseGroup.courseGroupID
      })));
    }
    
    // 获取所有教师ID，用于批量查询教师信息
    const teacherIDs = [...new Set(pairs.map(pair => pair.Course.teacherID))];
    console.log('需要查询的教师IDs:', teacherIDs);
    
    // 批量获取教师信息
    const teachersMessage = new QuerySafeUserInfoByUserIDListMessage(teacherIDs);
    const teachersResponse = await sendMessage(teachersMessage, 10000);
    const teachers = new Map<number, SafeUserInfo>();
    
    if (teachersResponse.ok) {
      const teacherInfos: SafeUserInfo[] = await teachersResponse.json();
      console.log('获取到的教师信息:', teacherInfos);
      teacherInfos.forEach(teacher => {
        teachers.set(teacher.userID, teacher);
      });
    } else {
      console.error('获取教师信息失败:', teachersResponse.status);
    }
    
    // 组装显示用的课程信息
    const displayCourses: CourseDisplayInfo[] = pairs.map(pair => ({
      courseID: pair.Course.courseID,
      courseName: pair.CourseGroup.name,
      teacherName: teachers.get(pair.Course.teacherID)?.userName || '未知教师',
      semester: new Date().getFullYear() + '年度', // 简化处理，实际可能需要从其他API获取
      courseGroupID: pair.CourseGroup.courseGroupID
    }));
    
    console.log('最终组装的课程显示信息:', displayCourses);
    console.log('最终课程数量:', displayCourses.length);
    
    return displayCourses;
  } catch (error) {
    console.error('获取所有课程信息失败:', error);
    throw error;
  }
};

// 获取特定课程的所有评价
const fetchCourseEvaluations = async (courseID: number): Promise<PublicEvaluationInfo[]> => {
  try {
    const userToken = getUserToken();
    const message = new QueryCourseEvaluationsMessage(userToken, courseID);
    const response = await sendMessage(message, 10000);
    
    if (!response.ok) {
      throw new Error('获取课程评价失败');
    }
    
    const evaluations: CourseEvaluation[] = await response.json();
    
    // 获取评价者信息
    const evaluatorIDs = [...new Set(evaluations.map(e => e.evaluatorID))];
    const evaluatorsMessage = new QuerySafeUserInfoByUserIDListMessage(evaluatorIDs);
    const evaluatorsResponse = await sendMessage(evaluatorsMessage, 10000);
    
    const evaluators = new Map<number, SafeUserInfo>();
    if (evaluatorsResponse.ok) {
      const evaluatorInfos: SafeUserInfo[] = await evaluatorsResponse.json();
      evaluatorInfos.forEach(evaluator => {
        evaluators.set(evaluator.userID, evaluator);
      });
    }
    
    // 组装公开评价信息
    const publicEvaluations: PublicEvaluationInfo[] = evaluations.map(evaluation => ({
      evaluatorName: evaluators.get(evaluation.evaluatorID)?.userName || '匿名用户',
      rating: parseInt(evaluation.rating),
      feedback: evaluation.feedback || '',
      evaluatedAt: new Date() // 实际应该从API获取评价时间
    }));
    
    return publicEvaluations;
  } catch (error) {
    console.error('获取课程评价失败:', error);
    throw error;
  }
};

const fetchExistingEvaluations = async (): Promise<CourseEvaluationData[]> => {
  try {
    const userToken = getUserToken();
    
    // 首先获取学生的课程列表
    const courses = await fetchEligibleCourses();
    
    // 为每门课程查询评价
    const evaluationPromises = courses.map(async (course) => {
      const message = new QueryCourseEvaluationsMessage(userToken, course.courseID);
      const response = await sendMessage(message, 10000);
      
      if (response.ok) {
        const evaluations: CourseEvaluation[] = await response.json();
        
        // 获取当前用户信息
        const userInfoMessage = new QuerySafeUserInfoByTokenMessage(userToken);
        const userInfoResponse = await sendMessage(userInfoMessage, 10000);
        
        if (userInfoResponse.ok) {
          const userInfo: SafeUserInfo = await userInfoResponse.json();
          
          // 找到当前用户的评价
          const userEvaluation = evaluations.find(evaluation => evaluation.evaluatorID === userInfo.userID);
          
          if (userEvaluation) {
            return {
              courseID: course.courseID,
              rating: parseInt(userEvaluation.rating),
              feedback: userEvaluation.feedback || '',
              lastUpdated: new Date() // 这里需要从API获取更新时间
            };
          }
        }
      }
      return null;
    });
    
    const results = await Promise.all(evaluationPromises);
    return results.filter(result => result !== null) as CourseEvaluationData[];
  } catch (error) {
    console.error('获取现有评价失败:', error);
    throw error;
  }
};

const submitEvaluation = async (courseID: number, rating: number, feedback: string): Promise<boolean> => {
  try {
    const userToken = getUserToken();
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
};

const updateEvaluation = async (courseID: number, rating: number, feedback: string): Promise<boolean> => {
  try {
    const userToken = getUserToken();
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
};

const deleteEvaluation = async (courseID: number): Promise<boolean> => {
  try {
    const userToken = getUserToken();
    const message = new DeleteCourseEvaluationMessage(userToken, courseID);
    const response = await sendMessage(message, 10000);
    
    if (response.ok) {
      const result = await response.text();
      return result.includes('成功') || result.includes('success');
    }
    return false;
  } catch (error) {
    console.error('删除评价失败:', error);
    return false;
  }
};

// 从全局store获取的数据
const userRole: UserRole = UserRole.student;

export const CourseEvaluationPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionLoading, setPermissionLoading] = useState<boolean>(true);
  const [canEvaluate, setCanEvaluate] = useState<boolean>(false);
  const [permissionMessage, setPermissionMessage] = useState<string>('');
  
  const [eligibleCourses, setEligibleCourses] = useState<CourseDisplayInfo[]>([]);
  const [existingEvaluations, setExistingEvaluations] = useState<CourseEvaluationData[]>([]);
  
  const [editingCourse, setEditingCourse] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingEvaluation | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 查询评价相关状态
  const [allCourses, setAllCourses] = useState<CourseDisplayInfo[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseDisplayInfo[]>([]);
  const [selectedCourseForView, setSelectedCourseForView] = useState<number | null>(null);
  const [courseEvaluations, setCourseEvaluations] = useState<PublicEvaluationInfo[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [evaluationsLoading, setEvaluationsLoading] = useState<boolean>(false);

  // 修复ResizeObserver错误
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
        return; // 抑制ResizeObserver错误
      }
      if (typeof args[0] === 'string' && args[0].includes('loop limit exceeded')) {
        return; // 抑制ResizeObserver loop limit错误
      }
      originalError.call(console, ...args);
    };
    
    console.warn = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
        return; // 抑制ResizeObserver警告
      }
      originalWarn.call(console, ...args);
    };

    // 全局错误处理
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('ResizeObserver')) {
        event.preventDefault();
        return;
      }
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.toString().includes('ResizeObserver')) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 检查权限和阶段
  useEffect(() => {
    const checkPermission = async () => {
      setPermissionLoading(true);
      try {
        const result = await checkPhaseAndPermission();
        setCanEvaluate(result.canEvaluate);
        setPermissionMessage(result.message);
      } catch (error) {
        message.error('检查评价权限失败');
        setCanEvaluate(false);
        setPermissionMessage('权限检查失败');
      } finally {
        setPermissionLoading(false);
      }
    };

    checkPermission();
  }, []);

  // 加载数据
  useEffect(() => {
    if (!canEvaluate) return;

    const loadData = async () => {
      setLoading(true);
      console.log('开始加载课程评价页面数据...');
      try {
        const [courses, evaluations, allCoursesData] = await Promise.all([
          fetchEligibleCourses(),
          fetchExistingEvaluations(),
          fetchAllCourses()
        ]);
        console.log('数据加载完成:', {
          eligibleCourses: courses.length,
          existingEvaluations: evaluations.length, 
          allCourses: allCoursesData.length
        });
        setEligibleCourses(courses);
        setExistingEvaluations(evaluations);
        setAllCourses(allCoursesData);
        setFilteredCourses(allCoursesData);
      } catch (error) {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [canEvaluate]);

  // 搜索课程
  const handleCourseSearch = (searchCriteria: CourseSearchCriteria) => {
    console.log('执行课程搜索，搜索条件:', searchCriteria);
    console.log('当前所有课程数量:', allCourses.length);
    
    setSearchLoading(true);
    
    // 使用requestAnimationFrame来避免ResizeObserver错误
    requestAnimationFrame(() => {
      setTimeout(() => {
        let filtered = allCourses;
        
        if (searchCriteria.courseName) {
          console.log('按课程名过滤:', searchCriteria.courseName);
          filtered = filtered.filter(course => 
            course.courseName.toLowerCase().includes(searchCriteria.courseName!.toLowerCase())
          );
          console.log('按课程名过滤后数量:', filtered.length);
        }
        
        if (searchCriteria.teacherName) {
          console.log('按教师名过滤:', searchCriteria.teacherName);
          filtered = filtered.filter(course => 
            course.teacherName.toLowerCase().includes(searchCriteria.teacherName!.toLowerCase())
          );
          console.log('按教师名过滤后数量:', filtered.length);
        }
        
        console.log('最终搜索结果:', { 
          searchCriteria, 
          totalCourses: allCourses.length, 
          filteredCount: filtered.length,
          filtered: filtered.slice(0, 5) // 打印前5个用于调试
        });
        
        setFilteredCourses(filtered);
        // 延迟设置loading状态，确保DOM更新完成
        setTimeout(() => setSearchLoading(false), 100);
      }, 200);
    });
  };

  // 查看课程评价
  const handleViewCourseEvaluations = async (courseID: number) => {
    setSelectedCourseForView(courseID);
    setEvaluationsLoading(true);
    
    try {
      const evaluations = await fetchCourseEvaluations(courseID);
      setCourseEvaluations(evaluations);
    } catch (error) {
      message.error('获取课程评价失败');
      setCourseEvaluations([]);
    } finally {
      setEvaluationsLoading(false);
    }
  };

  // 获取课程的现有评价
  const getExistingEvaluation = (courseID: number): CourseEvaluationData | undefined => {
    return existingEvaluations.find(evaluation => evaluation.courseID === courseID);
  };

  // 开始编辑
  const startEditing = (courseID: number) => {
    const existing = getExistingEvaluation(courseID);
    setEditingCourse(courseID);
    setEditingData({
      courseID,
      rating: existing?.rating || 0,
      feedback: existing?.feedback || ''
    });
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingCourse(null);
    setEditingData(null);
  };

  // 保存评价
  const saveEvaluation = async () => {
    if (!editingData || editingData.rating === 0) {
      message.warning('请至少给出星级评分');
      return;
    }

    setSubmitting(true);
    try {
      const existing = getExistingEvaluation(editingData.courseID);
      let success = false;

      if (existing) {
        // 更新现有评价
        success = await updateEvaluation(
          editingData.courseID,
          editingData.rating,
          editingData.feedback
        );
      } else {
        // 提交新评价
        success = await submitEvaluation(
          editingData.courseID,
          editingData.rating,
          editingData.feedback
        );
      }

      if (success) {
        // 更新本地状态
        const newEvaluation: CourseEvaluationData = {
          courseID: editingData.courseID,
          rating: editingData.rating,
          feedback: editingData.feedback,
          lastUpdated: new Date()
        };

        setExistingEvaluations(prev => {
          const filtered = prev.filter(evaluation => evaluation.courseID !== editingData.courseID);
          return [...filtered, newEvaluation];
        });

        message.success(existing ? '评价修改成功' : '评价提交成功');
        cancelEditing();
      } else {
        message.error('操作失败，请重试');
      }
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评价
  const deleteEvaluationHandler = async (courseID: number) => {
    try {
      const success = await deleteEvaluation(courseID);
      if (success) {
        setExistingEvaluations(prev => 
          prev.filter(evaluation => evaluation.courseID !== courseID)
        );
        message.success('评价删除成功');
      } else {
        message.error('删除失败，请重试');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  // 渲染评价卡片
  const renderEvaluationCard = (course: CourseDisplayInfo) => {
    const existing = getExistingEvaluation(course.courseID);
    const isEditing = editingCourse === course.courseID;

    return (
      <Card
        key={course.courseID}
        className="course-evaluation-card"
        style={{ 
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(255, 105, 180, 0.15)',
          border: '1px solid rgba(255, 182, 216, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          height: 'fit-content'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Avatar 
              icon={<BookOutlined />} 
              style={{ 
                backgroundColor: '#ff69b4',
                color: 'white'
              }} 
            />
            <div>
              <Title level={4} style={{ margin: 0, color: '#d81b60' }}>
                {course.courseName}
              </Title>
              <Text type="secondary">
                {course.teacherName} · {course.semester}
              </Text>
            </div>
          </Space>
        </div>

        {isEditing ? (
          // 编辑模式
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ color: '#d81b60' }}>评分：</Text>
              <Rate
                value={editingData?.rating || 0}
                onChange={(value) => 
                  setEditingData(prev => prev ? { ...prev, rating: value } : null)
                }
                style={{ 
                  fontSize: 24,
                  color: '#ffd700',
                  marginLeft: 8
                }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ color: '#d81b60' }}>文字评价：</Text>
              <TextArea
                value={editingData?.feedback || ''}
                onChange={(e) => 
                  setEditingData(prev => prev ? { ...prev, feedback: e.target.value } : null)
                }
                placeholder="请输入对这门课程的评价..."
                rows={6}
                style={{ 
                  marginTop: 8,
                  borderColor: '#ffb6d8',
                  fontSize: '14px'
                }}
                maxLength={500}
                showCount
              />
            </div>

            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={saveEvaluation}
                loading={submitting}
                style={{
                  backgroundColor: '#ff69b4',
                  borderColor: '#ff69b4'
                }}
              >
                保存
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={cancelEditing}
                disabled={submitting}
              >
                取消
              </Button>
            </Space>
          </div>
        ) : (
          // 显示模式
          <div>
            {existing ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ color: '#d81b60' }}>我的评分：</Text>
                  <Rate
                    disabled
                    value={existing.rating}
                    style={{ 
                      fontSize: 20,
                      color: '#ffd700',
                      marginLeft: 8
                    }}
                  />
                  <Tag color="pink" style={{ marginLeft: 8 }}>
                    {existing.rating}分
                  </Tag>
                </div>
                
                {existing.feedback && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ color: '#d81b60' }}>我的评价：</Text>
                    <Paragraph style={{ 
                      marginTop: 8,
                      padding: 12,
                      backgroundColor: 'rgba(255, 182, 216, 0.1)',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 182, 216, 0.3)'
                    }}>
                      {existing.feedback}
                    </Paragraph>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    最后更新：{existing.lastUpdated?.toLocaleString()}
                  </Text>
                </div>

                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => startEditing(course.courseID)}
                    style={{
                      backgroundColor: '#ff85c0',
                      borderColor: '#ff85c0'
                    }}
                  >
                    修改评价
                  </Button>
                  <Popconfirm
                    title="确定要删除这个评价吗？"
                    onConfirm={() => deleteEvaluationHandler(course.courseID)}
                    okText="确定"
                    cancelText="取消"
                    okButtonProps={{
                      style: { backgroundColor: '#ff69b4', borderColor: '#ff69b4' }
                    }}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                    >
                      删除评价
                    </Button>
                  </Popconfirm>
                </Space>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">您还没有评价过这门课程</Text>
                </div>
                <Button
                  type="primary"
                  icon={<StarOutlined />}
                  onClick={() => startEditing(course.courseID)}
                  style={{
                    backgroundColor: '#ff69b4',
                    borderColor: '#ff69b4'
                  }}
                >
                  开始评价
                </Button>
              </>
            )}
          </div>
        )}
      </Card>
    );
  };

  if (permissionLoading) {
    return (
      <DefaultLayout role={userRole}>
        <div style={{ 
          padding: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
        }}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>正在检查评价权限...</Text>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!canEvaluate) {
    return (
      <DefaultLayout role={userRole}>
        <div style={{ 
          padding: '24px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ color: '#d81b60', textAlign: 'center', marginBottom: '24px' }}>
              课程评价
            </Title>
            <Alert
              message="暂时无法进行课程评价"
              description={permissionMessage}
              type="warning"
              showIcon
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 182, 216, 0.3)',
                borderRadius: '12px'
              }}
            />
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // 渲染课程搜索组件
  const renderCourseSearchPanel = () => (
    <Card
      title={
        <Space>
          <SearchOutlined style={{ color: '#ff69b4' }} />
          <span style={{ color: '#d81b60' }}>课程评价查询</span>
        </Space>
      }
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 182, 216, 0.3)',
        borderRadius: '12px',
        marginBottom: '16px'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <Form
        layout="vertical"
        onFinish={(values) => handleCourseSearch(values)}
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="课程名称" name="courseName">
              <Input placeholder="请输入课程名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="教师姓名" name="teacherName">
              <Input placeholder="请输入教师姓名" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{
                backgroundColor: '#ff69b4',
                borderColor: '#ff69b4'
              }}
              loading={searchLoading}
            >
              搜索课程
            </Button>
            <Button 
              onClick={() => {
                console.log('重置搜索，显示所有课程');
                setFilteredCourses(allCourses);
              }}
            >
              显示全部
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Divider orientation="left">
        <Text strong style={{ color: '#d81b60' }}>课程列表</Text>
      </Divider>

      {searchLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : (
        <List
          dataSource={filteredCourses}
          renderItem={(course) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewCourseEvaluations(course.courseID)}
                  style={{ color: '#ff69b4' }}
                >
                  查看评价
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<BookOutlined />} 
                    style={{ backgroundColor: '#ff85c0' }}
                  />
                }
                title={
                  <Text strong style={{ color: '#d81b60' }}>
                    {course.courseName}
                  </Text>
                }
                description={
                  <Text type="secondary">
                    {course.teacherName} · {course.semester}
                  </Text>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无课程数据' }}
          style={{ maxHeight: '400px', overflow: 'auto' }}
        />
      )}
    </Card>
  );

  // 渲染课程评价展示组件
  const renderCourseEvaluationsPanel = () => {
    const selectedCourse = allCourses.find(course => course.courseID === selectedCourseForView);
    
    return (
      <Card
        title={
          selectedCourse ? (
            <Space>
              <BookOutlined style={{ color: '#ff69b4' }} />
              <span style={{ color: '#d81b60' }}>
                {selectedCourse.courseName} - 课程评价
              </span>
            </Space>
          ) : (
            <Space>
              <EyeOutlined style={{ color: '#ff69b4' }} />
              <span style={{ color: '#d81b60' }}>查看课程评价</span>
            </Space>
          )
        }
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 182, 216, 0.3)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        {!selectedCourseForView ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Empty
              description="请从左侧选择一门课程查看评价"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : evaluationsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>正在加载评价数据...</Text>
            </div>
          </div>
        ) : courseEvaluations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Empty
              description="这门课程还没有任何评价"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div>
            {selectedCourse && (
              <div style={{ 
                marginBottom: 16,
                padding: '12px',
                backgroundColor: 'rgba(255, 182, 216, 0.1)',
                borderRadius: '8px'
              }}>
                <Text strong style={{ color: '#d81b60' }}>
                  {selectedCourse.courseName}
                </Text>
                <br />
                <Text type="secondary">
                  {selectedCourse.teacherName} · {selectedCourse.semester}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  共 {courseEvaluations.length} 条评价
                </Text>
              </div>
            )}

            <List
              dataSource={courseEvaluations}
              renderItem={(evaluation, index) => (
                <List.Item
                  style={{
                    padding: '16px',
                    marginBottom: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 182, 216, 0.2)'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#ff85c0' }}>
                        {evaluation.evaluatorName.charAt(0)}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text strong>{evaluation.evaluatorName}</Text>
                        <Rate 
                          disabled 
                          value={evaluation.rating} 
                          style={{ fontSize: '16px', color: '#ffd700' }}
                        />
                        <Tag color="pink">{evaluation.rating}分</Tag>
                      </Space>
                    }
                    description={
                      <div style={{ marginTop: '8px' }}>
                        {evaluation.feedback ? (
                          <Paragraph style={{ 
                            margin: 0,
                            padding: '8px',
                            backgroundColor: 'rgba(255, 182, 216, 0.05)',
                            borderRadius: '4px'
                          }}>
                            {evaluation.feedback}
                          </Paragraph>
                        ) : (
                          <Text type="secondary">该同学没有留下文字评价</Text>
                        )}
                        {evaluation.evaluatedAt && (
                          <div style={{ marginTop: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              评价时间：{evaluation.evaluatedAt.toLocaleString()}
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              style={{ maxHeight: '500px', overflow: 'auto' }}
            />
          </div>
        )}
      </Card>
    );
  };

  return (
    <DefaultLayout role={userRole}>
      <div style={{ 
        padding: '24px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgb(255, 222, 237) 0%, rgb(254, 201, 226) 100%)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Title level={2} style={{ color: '#d81b60', textAlign: 'center', marginBottom: '24px' }}>
            课程评价中心
          </Title>
          
          <Alert
            message={permissionMessage}
            type="success"
            showIcon
            style={{ 
              marginBottom: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 182, 216, 0.3)',
              borderRadius: '12px'
            }}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>正在加载课程数据...</Text>
              </div>
            </div>
          ) : (
            <Tabs
              defaultActiveKey="view"
              type="card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '8px'
              }}
              items={[
                {
                  key: 'view',
                  label: (
                    <span style={{ color: '#d81b60', fontWeight: 'bold' }}>
                      <EyeOutlined /> 查看课程评价
                    </span>
                  ),
                  children: (
                    <Row gutter={16}>
                      <Col span={10}>
                        {renderCourseSearchPanel()}
                      </Col>
                      <Col span={14}>
                        {renderCourseEvaluationsPanel()}
                      </Col>
                    </Row>
                  )
                },
                {
                  key: 'personal',
                  label: (
                    <span style={{ color: '#d81b60', fontWeight: 'bold' }}>
                      <StarOutlined /> 我的课程评价
                    </span>
                  ),
                  children: eligibleCourses.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '50px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px'
                    }}>
                      <Empty
                        description="您还没有可以评价的课程"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  ) : (
                    <div>
                      <div style={{ 
                        marginBottom: 16,
                        padding: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '8px'
                      }}>
                        <Text type="secondary">
                          您可以评价以下 {eligibleCourses.length} 门课程（包括已退课的课程）
                        </Text>
                      </div>
                      
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '16px'
                      }}>
                        {eligibleCourses.map(renderEvaluationCard)}
                      </div>
                    </div>
                  )
                }
              ]}
            />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CourseEvaluationPage;
