// EvaluationSearchForm.tsx
import React from 'react';
import { Form, Input, Button, Space, Row, Col } from 'antd';
import { CourseSearchCriteria } from './hooks/useCourseEvaluationData';

interface EvaluationSearchFormProps {
  onSearch: (criteria: CourseSearchCriteria) => void;
  onReset: () => void;
  loading: boolean;
}

export const EvaluationSearchForm: React.FC<EvaluationSearchFormProps> = ({
  onSearch,
  onReset,
  loading
}) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSearch}
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
            loading={loading}
          >
            搜索课程
          </Button>
          <Button 
            onClick={handleReset}
            disabled={loading}
          >
            显示全部
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
