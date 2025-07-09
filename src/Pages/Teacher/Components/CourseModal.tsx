import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { DayOfWeek } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod } from 'Plugins/CourseManagementService/Objects/TimePeriod';
import { TimeTableSelector } from '../../../Components/TimeTableSelector';

interface CourseModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  loading?: boolean;
  course?: CourseInfo;
  onOk: (values: { location: string; capacity: number; courseTimes?: { dayOfWeek: DayOfWeek; timePeriod: TimePeriod }[] }) => void;
  onCancel: () => void;
}


const CourseModal: React.FC<CourseModalProps> = ({
  visible,
  mode,
  loading,
  course,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [selectedTimes, setSelectedTimes] = React.useState<{ dayOfWeek: DayOfWeek; timePeriod: TimePeriod }[]>([]);

  React.useEffect(() => {
    if (visible) {
      if (mode === 'edit' && course) {
        form.setFieldsValue({ 
          location: course.location, 
          capacity: course.courseCapacity 
        });
      } else {
        form.resetFields();
        setSelectedTimes([]);
      }
    }
  }, [visible, mode, course, form]);

  const handleTimeTableChange = (
    _selectedTimes: boolean[][], 
    courseTimesForAPI: { dayOfWeek: DayOfWeek; timePeriod: TimePeriod }[]
  ) => {
    setSelectedTimes(courseTimesForAPI);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onOk({
        ...values,
        courseTimes: mode === 'add' ? selectedTimes : undefined
      });
    });
  };

  return (
    <Modal
      title={mode === 'add' ? '新增课程' : '编辑课程'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      okButtonProps={{ style: { background: '#1e40af', border: 'none' }, loading }}
      cancelButtonProps={{ style: { borderColor: '#1e40af', color: '#1e40af' } }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          name="location" 
          label={<span style={{ color: '#1e40af' }}>上课地点</span>} 
          rules={[{ required: true, message: '请输入上课地点' }]}
        > 
          <Input />
        </Form.Item>
        <Form.Item 
          name="capacity" 
          label={<span style={{ color: '#1e40af' }}>容量</span>} 
          rules={[{ required: true, message: '请输入容量' }]}
        > 
          <Input type="number" min={1} />
        </Form.Item>
        {mode === 'add' && (
          <Form.Item label={<span style={{ color: '#1e40af' }}>课程时间安排</span>}>
            <TimeTableSelector 
              onChange={handleTimeTableChange}
              defaultSelected={false}
            />
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
              点击表格选择上课时间段，如课程无需占用时间段可不选择，系统会弹窗确认。
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CourseModal;
