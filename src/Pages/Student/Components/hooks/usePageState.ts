// usePageState.ts - 页面状态管理的自定义hook
import { useState, useEffect } from 'react';
import { QuerySafeUserInfoByTokenMessage } from 'Plugins/UserAccountService/APIs/QuerySafeUserInfoByTokenMessage';
import { QuerySemesterPhaseStatusMessage } from 'Plugins/SemesterPhaseService/APIs/QuerySemesterPhaseStatusMessage';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';
import { SemesterPhase } from 'Plugins/SemesterPhaseService/Objects/SemesterPhase';
import { UserRole } from 'Plugins/UserAccountService/Objects/UserRole';
import { getUserToken } from 'Globals/GlobalStore';

export interface UsePageStateResult {
  userToken: string;
  userInfo: SafeUserInfo | null;
  semesterPhase: SemesterPhase | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isStudent: boolean;
}

export const usePageState = (): UsePageStateResult => {
  const [userToken, setUserToken] = useState<string>('');
  const [userInfo, setUserInfo] = useState<SafeUserInfo | null>(null);
  const [semesterPhase, setSemesterPhase] = useState<SemesterPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取用户token
        const token = getUserToken() || '';
        if (!token) {
          setError('未找到用户令牌，请重新登录');
          setLoading(false);
          return;
        }
        setUserToken(token);

        // 验证用户信息
        await new Promise<void>((resolve, reject) => {
          new QuerySafeUserInfoByTokenMessage(token).send(
            (response: string) => {
              try {
                const raw = JSON.parse(response);
                const safeUser = new SafeUserInfo(raw.userID, raw.userName, raw.accountName, raw.role);
                setUserInfo(safeUser);
                resolve();
              } catch (e) {
                setError('解析用户信息失败');
                reject(e);
              }
            },
            (error: string) => {
              setError('用户验证失败: ' + error);
              reject(error);
            }
          );
        });

        // 获取学期阶段信息
        await new Promise<void>((resolve, reject) => {
          new QuerySemesterPhaseStatusMessage(token).send(
            (response: string) => {
              try {
                const phase: SemesterPhase = JSON.parse(response);
                setSemesterPhase(phase);
                resolve();
              } catch (e) {
                setError('解析学期阶段失败');
                reject(e);
              }
            },
            (error: string) => {
              setError('获取学期阶段信息失败: ' + error);
              reject(error);
            }
          );
        });

      } catch (err) {
        console.error('页面初始化失败:', err);
      } finally {
        setLoading(false);
      }
    };

    initializePageData();
  }, []);

  const isAuthenticated = !!userToken && !!userInfo;
  const isStudent = userInfo?.role === UserRole.student;

  return {
    userToken,
    userInfo,
    semesterPhase,
    loading,
    error,
    isAuthenticated,
    isStudent
  };
};
