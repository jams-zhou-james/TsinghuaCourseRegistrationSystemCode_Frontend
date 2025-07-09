// src/Pages/Student/CourseEvaluationPage.tsx

export const courseEvaluationPagePath = '/student/course-evaluation';

import React, { useEffect, useState } from 'react';
import { 
  Card,   Rate,   Input,   Button,   List,   message,   Typography,   Space,   Tag,   Avatar,   Divider,  Alert,  Empty,  Spin,  Modal,  Popconfirm
} from 'antd';
import { 
  StarOutlined,   EditOutlined,   DeleteOutlined,   SaveOutlined,  CloseOutlined,  BookOutlined
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
import { Rating, getRating } from 'Plugins/CourseEvaluationService/Objects/Rating';
import { CourseEvaluation } from 'Plugins/CourseEvaluationService/Objects/CourseEvaluation';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
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
      try {
        const [courses, evaluations] = await Promise.all([
          fetchEligibleCourses(),
          fetchExistingEvaluations()
        ]);
        setEligibleCourses(courses);
        setExistingEvaluations(evaluations);
      } catch (error) {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [canEvaluate]);

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
          ) : eligibleCourses.length === 0 ? (
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
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CourseEvaluationPage;
