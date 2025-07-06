
import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { CourseInfo } from 'Plugins/CourseManagementService/Objects/CourseInfo';
import { DayOfWeek, dayOfWeekList } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod, timePeriodList } from 'Plugins/CourseManagementService/Objects/TimePeriod';

interface CourseModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  loading?: boolean;
  course?: CourseInfo;
  onOk: (values: { location: string; capacity: number; courseTimes?: { dayOfWeek: DayOfWeek; timePeriod: TimePeriod }[] }) => void;
  onCancel: () => void;
}

function dayOfWeekLabel(d: DayOfWeek) {
  switch (d) {
    case DayOfWeek.monday: return '周一';
    case DayOfWeek.tuesday: return '周二';
    case DayOfWeek.wednesday: return '周三';
    case DayOfWeek.thursday: return '周四';
    case DayOfWeek.friday: return '周五';
    case DayOfWeek.saturday: return '周六';
    case DayOfWeek.sunday: return '周日';
    default: return d;
  }
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

  React.useEffect(() => {
    if (visible) {
      if (mode === 'edit' && course) {
        form.setFieldsValue({ location: course.location, capacity: course.courseCapacity });
      } else {
        form.resetFields();
      }
    }
  }, [visible, mode, course, form]);

  return (
    <Modal
      title={mode === 'add' ? '新增课程' : '编辑课程'}
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
        <Form.Item name="location" label={<span style={{ color: '#1e40af' }}>上课地点</span>} rules={[{ required: true, message: '请输入上课地点' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="capacity" label={<span style={{ color: '#1e40af' }}>容量</span>} rules={[{ required: true, message: '请输入容量' }]}> 
          <Input type="number" />
        </Form.Item>
        {mode === 'add' && (
          <Form.List name="courseTimes">
            {(fields, { add, remove }) => (
              <div>
                <div style={{ marginBottom: 8, color: '#1e40af', fontWeight: 500 }}>课程时间安排（可添加多个时间段）</div>
                {fields.map((field) => (
                  <div key={field.key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Form.Item {...field} name={[field.name, 'dayOfWeek']} rules={[{ required: true, message: '请选择星期' }]} style={{ marginBottom: 0 }}>
                      <Select style={{ width: 120 }} placeholder="星期"
                        options={dayOfWeekList.map(d => ({ label: dayOfWeekLabel(d), value: d }))}
                      />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'timePeriod']} rules={[{ required: true, message: '请选择时间段' }]} style={{ marginBottom: 0 }}>
                      <Select style={{ width: 140 }} placeholder="时间段"
                        options={timePeriodList.map(t => ({ label: t, value: t }))}
                      />
                    </Form.Item>
                    <Button danger type="link" onClick={() => remove(field.name)} style={{ padding: 0 }}>删除</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} style={{ width: 260, marginBottom: 8 }}>添加时间段</Button>
                <div style={{ color: '#64748b', fontSize: 12 }}>如课程无需占用时间段可不添加，系统会弹窗确认。</div>
              </div>
            )}
          </Form.List>
        )}
      </Form>
    </Modal>
  );
};

export default CourseModal;
