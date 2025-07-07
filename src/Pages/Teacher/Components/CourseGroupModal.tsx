
import React from 'react';
import { Modal, Form, Input } from 'antd';
import { CourseGroup } from 'Plugins/CourseManagementService/Objects/CourseGroup';

interface CourseGroupModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  loading?: boolean;
  group?: CourseGroup;
  onOk: (values: { groupName: string; credits: number }) => void;
  onCancel: () => void;
}

const CourseGroupModal: React.FC<CourseGroupModalProps> = ({
  visible,
  mode,
  loading,
  group,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      if (mode === 'edit' && group) {
        form.setFieldsValue({ groupName: group.name, credits: group.credit });
      } else {
        form.resetFields();
      }
    }
  }, [visible, mode, group, form]);

  return (
    <Modal
      title={mode === 'add' ? '新增课程组' : '编辑课程组'}
      open={visible}
      onOk={() => {
        form.validateFields().then(values => {
          onOk(values);
        });
      }}
      onCancel={onCancel}
      width={600}
      okButtonProps={{ style: { background: '#1e40af', border: 'none' }, loading }}
      cancelButtonProps={{ style: { borderColor: '#1e40af', color: '#1e40af' } }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="groupName" label={<span style={{ color: '#1e40af' }}>课程组名称</span>} rules={[{ required: false, message: '请输入课程组名称' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="credits" label={<span style={{ color: '#1e40af' }}>学分</span>} rules={[{ required: false, message: '请输入学分' }]}> 
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CourseGroupModal;
