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

// API相关导入（预留接口）
// import { SubmitCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/SubmitCourseEvaluationMessage';
// import { UpdateCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/UpdateCourseEvaluationMessage';
// import { DeleteCourseEvaluationMessage } from 'Plugins/CourseEvaluationService/APIs/DeleteCourseEvaluationMessage';
// import { QueryCourseEvaluationsMessage } from 'Plugins/CourseEvaluationService/APIs/QueryCourseEvaluationsMessage';
// import { CheckStudentHasSuccessfullyTakenCourseMessage } from 'Plugins/CourseSelectionService/APIs/CheckStudentHasSuccessfullyTakenCourseMessage';
// import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
// import { Rating } from 'Plugins/CourseEvaluationService/Objects/Rating';
// import { CourseEvaluation } from 'Plugins/CourseEvaluationService/Objects/CourseEvaluation';
// import { Phase } from 'Plugins/SemesterPhaseService/Objects/Phase';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 临时数据结构（待接入API时替换）
interface CourseInfo {
  courseID: string;
  courseName: string;
  teacherName: string;
  semester: string;
  groupID: string;
}

interface CourseEvaluationData {
  courseID: string;
  rating: number;
  feedback: string;
  lastUpdated?: Date;
}

interface EditingEvaluation {
  courseID: string;
  rating: number;
  feedback: string;
}

// Mock数据
const mockEligibleCourses: CourseInfo[] = [
  { courseID: 'c1', courseName: '高等数学', teacherName: '张教授', semester: '2024春', groupID: 'g1' },
  { courseID: 'c2', courseName: '大学物理', teacherName: '李教授', semester: '2024春', groupID: 'g2' },
  { courseID: 'c3', courseName: '线性代数', teacherName: '王教授', semester: '2023秋', groupID: 'g3' },
  { courseID: 'c4', courseName: '计算机程序设计', teacherName: '赵教授', semester: '2024春', groupID: 'g4' },
  { courseID: 'c5', courseName: '数据结构', teacherName: '陈教授', semester: '2023秋', groupID: 'g5' },
];

const mockExistingEvaluations: CourseEvaluationData[] = [
  { courseID: 'c1', rating: 4, feedback: '老师讲课很清楚，课程内容丰富。', lastUpdated: new Date('2024-01-15') },
  { courseID: 'c3', rating: 5, feedback: '非常好的数学课程，推荐！', lastUpdated: new Date('2024-01-10') },
];

// 模拟API调用函数
const mockCheckPhaseAndPermission = async (): Promise<{ canEvaluate: boolean; message: string }> => {
  // 模拟API调用：QuerySemesterPhaseStatusMessage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        canEvaluate: true, 
        message: '当前处于阶段2，可以进行课程评价' 
      });
    }, 1000);
  });
};

const mockFetchEligibleCourses = async (studentID: string): Promise<CourseInfo[]> => {
  // 模拟API调用：CheckStudentHasSuccessfullyTakenCourseMessage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEligibleCourses);
    }, 1500);
  });
};

const mockFetchExistingEvaluations = async (studentID: string): Promise<CourseEvaluationData[]> => {
  // 模拟API调用：QueryCourseEvaluationsMessage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockExistingEvaluations);
    }, 1200);
  });
};

const mockSubmitEvaluation = async (courseID: string, rating: number, feedback: string): Promise<boolean> => {
  // 模拟API调用：SubmitCourseEvaluationMessage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};

const mockUpdateEvaluation = async (courseID: string, rating: number, feedback: string): Promise<boolean> => {
  // 模拟API调用：UpdateCourseEvaluationMessage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 800);
  });
};

const mockDeleteEvaluation = async (courseID: string): Promise<boolean> => {
  // 模拟API调用：DeleteCourseEvaluationMessage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 600);
  });
};

// 从全局store获取的数据（模拟）
const userID: string = 'student123';
const userRole: UserRole = UserRole.student;

export const CourseEvaluationPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionLoading, setPermissionLoading] = useState<boolean>(true);
  const [canEvaluate, setCanEvaluate] = useState<boolean>(false);
  const [permissionMessage, setPermissionMessage] = useState<string>('');
  
  const [eligibleCourses, setEligibleCourses] = useState<CourseInfo[]>([]);
  const [existingEvaluations, setExistingEvaluations] = useState<CourseEvaluationData[]>([]);
  
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingEvaluation | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 检查权限和阶段
  useEffect(() => {
    const checkPermission = async () => {
      setPermissionLoading(true);
      try {
        const result = await mockCheckPhaseAndPermission();
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
          mockFetchEligibleCourses(userID),
          mockFetchExistingEvaluations(userID)
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
  const getExistingEvaluation = (courseID: string): CourseEvaluationData | undefined => {
    return existingEvaluations.find(evaluation => evaluation.courseID === courseID);
  };

  // 开始编辑
  const startEditing = (courseID: string) => {
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
        success = await mockUpdateEvaluation(
          editingData.courseID,
          editingData.rating,
          editingData.feedback
        );
      } else {
        // 提交新评价
        success = await mockSubmitEvaluation(
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
  const deleteEvaluation = async (courseID: string) => {
    try {
      const success = await mockDeleteEvaluation(courseID);
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
  const renderEvaluationCard = (course: CourseInfo) => {
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
                    onConfirm={() => deleteEvaluation(course.courseID)}
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
