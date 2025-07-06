
import React, { useRef } from 'react';
import { Modal, Input, Button } from 'antd';
import type { InputRef } from 'antd';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';
import { SafeUserInfo } from 'Plugins/UserAccountService/Objects/SafeUserInfo';

interface AuthTeacherModalProps {
  visible: boolean;
  group: CourseGroup;
  authTeachers: number[];
  authTeacherInfos: SafeUserInfo[];
  loading?: boolean;
  onGrant: (group: CourseGroup, teacherID: number) => void;
  onRevoke: (group: CourseGroup, teacherID: number) => void;
  onCancel: () => void;
}

const AuthTeacherModal: React.FC<AuthTeacherModalProps> = ({
  visible,
  group,
  authTeachers,
  authTeacherInfos,
  loading,
  onGrant,
  onRevoke,
  onCancel,
}) => {
  const grantInputRef = useRef<InputRef>(null);
  const revokeInputRef = useRef<InputRef>(null);

  return (
    <Modal
      title={`授权老师 - ${group.name}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <div>
        已授权老师：
        {authTeacherInfos.length > 0
          ? authTeacherInfos.map(t => `${t.userName}（${t.userID}）`).join('，')
          : (authTeachers.length > 0 ? authTeachers.join(', ') : '无')}
      </div>
      <div style={{ marginTop: 12 }}>
        <Input type="number" placeholder="输入老师ID授权" ref={grantInputRef} style={{ width: 180, marginRight: 8 }} />
        <Button type="primary" size="small" loading={loading} onClick={() => {
          const tid = Number(grantInputRef.current?.input?.value);
          if (tid) onGrant(group, tid);
        }}>授权</Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Input type="number" placeholder="输入老师ID取消授权" ref={revokeInputRef} style={{ width: 180, marginRight: 8 }} />
        <Button size="small" loading={loading} onClick={() => {
          const tid = Number(revokeInputRef.current?.input?.value);
          if (tid) onRevoke(group, tid);
        }}>取消授权</Button>
      </div>
    </Modal>
  );
};

export default AuthTeacherModal;
