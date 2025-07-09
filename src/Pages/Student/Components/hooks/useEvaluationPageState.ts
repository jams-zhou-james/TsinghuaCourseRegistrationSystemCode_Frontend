// useEvaluationPageState.ts - 课程评价页面状态管理
import { useState, useEffect } from 'react';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { getUserToken } from 'Globals/GlobalStore';
import { sendMessage } from 'Plugins/CommonUtils/Send/SendMessage';

export interface EvaluationPageStateResult {
  userToken: string;
  userInfo: SafeUserInfo | null;
  semesterPhase: SemesterPhase | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isStudent: boolean;
  canEvaluate: boolean;
  permissionMessage: string;
  permissionLoading: boolean;
}

export const useEvaluationPageState = (): EvaluationPageStateResult => {
  const [userToken, setUserToken] = useState<string>('');
  const [userInfo, setUserInfo] = useState<SafeUserInfo | null>(null);
  const [semesterPhase, setSemesterPhase] = useState<SemesterPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEvaluate, setCanEvaluate] = useState<boolean>(false);
  const [permissionMessage, setPermissionMessage] = useState<string>('');
  const [permissionLoading, setPermissionLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializePageData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('正在初始化课程评价页面状态...');

        // 获取用户token
        const token = getUserToken() || '';
        if (!token) {
          console.error('未找到用户令牌');
          setError('未找到用户令牌，请重新登录');
          setLoading(false);
          return;
        }

        // 验证token格式
        if (token.trim() === '' || token.length < 10) {
          console.error('用户令牌格式无效');
          setError('用户令牌格式无效，请重新登录');
          setLoading(false);
          return;
        }

        console.log(`成功获取到用户token: ${token.substring(0, 8)}..., 长度: ${token.length}`);
        setUserToken(token);

        // 先尝试获取用户信息
        console.log('正在获取用户信息...');
        const userInfoResponse = await sendMessage(new QuerySafeUserInfoByTokenMessage(token), 10000);
        
        if (!userInfoResponse.ok) {
          console.error('获取用户信息失败:', userInfoResponse.status, userInfoResponse.statusText);
          
          // 尝试延迟重试一次
          console.log('延迟1秒后重试获取用户信息...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const retryResponse = await sendMessage(new QuerySafeUserInfoByTokenMessage(token), 10000);
          if (!retryResponse.ok) {
            throw new Error(`获取用户信息失败 (${retryResponse.status}): ${retryResponse.statusText}`);
          }
          
          const userInfoData: SafeUserInfo = await retryResponse.json();
          console.log('重试成功获取用户信息:', userInfoData.userID, userInfoData.userName);
          setUserInfo(userInfoData);
        } else {
          const userInfoData: SafeUserInfo = await userInfoResponse.json();
          console.log('成功获取用户信息:', userInfoData.userID, userInfoData.userName);
          setUserInfo(userInfoData);
        }

        // 获取学期阶段信息
        console.log('正在获取学期阶段信息...');
        const semesterPhaseResponse = await sendMessage(new QuerySemesterPhaseStatusMessage(token), 10000);
        
        if (semesterPhaseResponse.ok) {
          const semesterPhaseData: SemesterPhase = await semesterPhaseResponse.json();
          console.log('成功获取学期阶段信息:', semesterPhaseData.currentPhase);
          setSemesterPhase(semesterPhaseData);
          
          // 检查评价权限
          const hasPermission = semesterPhaseData.permissions.allowStudentEvaluate;
          console.log('当前评价权限状态:', hasPermission ? '允许评价' : '不允许评价');
          setCanEvaluate(hasPermission);
          
          const permissionStatus = semesterPhaseData.permissions.allowStudentEvaluate;
          setPermissionMessage(`当前处于阶段${semesterPhaseData.currentPhase}，${permissionStatus ? '可以' : '不可以'}进行课程评价`);
          setPermissionLoading(false);
        } else {
          console.error('获取学期阶段信息失败:', semesterPhaseResponse.status, semesterPhaseResponse.statusText);
          throw new Error(`获取学期阶段信息失败 (${semesterPhaseResponse.status}): ${semesterPhaseResponse.statusText}`);
        }
        
        console.log('页面状态初始化完成');

      } catch (err) {
        console.error('初始化页面数据失败:', err);
        setError('加载页面数据失败，请刷新重试: ' + (err instanceof Error ? err.message : '未知错误'));
        setPermissionLoading(false);
      } finally {
        setLoading(false);
      }
    };

    initializePageData();
  }, []);

  // 用户是否已认证
  const isAuthenticated = !!userToken && !!userInfo;
  // 是否为学生角色
  const isStudent = isAuthenticated && userInfo?.role === UserRole.student;

  return {
    userToken,
    userInfo,
    semesterPhase,
    loading,
    error,
    isAuthenticated,
    isStudent,
    canEvaluate,
    permissionMessage,
    permissionLoading
  };
};
