// CourseSearchForm.tsx
import React from 'react';
import { Form, Input, Button, Row, Col, Card, Space } from 'antd';
import { SearchOutlined, BookOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface CourseSearchFormProps {
  form: any;
  onSearch: (values: any) => void;
  searching: boolean;
}

export const CourseSearchForm: React.FC<CourseSearchFormProps> = ({ 
  form, 
  onSearch, 
  searching 
}) => {
  return (
    <Card
      title={
        <Space>
          <SearchOutlined style={{ color: '#ff69b4' }} />
          <span style={{ color: '#d81b60' }}>课程搜索</span>
        </Space>
      }
      style={{
        marginBottom: 24,
        borderRadius: 12,
        border: '1px solid rgba(255, 182, 216, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <Form form={form} layout="vertical" onFinish={onSearch}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="courseName" label="课程名称">
              <Input 
                placeholder="请输入课程名称" 
                prefix={<BookOutlined style={{ color: '#ffb6d8' }} />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="courseID" label="课程编号">
              <Input placeholder="请输入课程编号" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="teacher" label="授课教师">
              <Input 
                placeholder="请输入教师姓名" 
                prefix={<UserOutlined style={{ color: '#ffb6d8' }} />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="schedule" label="上课时间">
              <Input 
                placeholder="如: 周一 8:00-10:00" 
                prefix={<ClockCircleOutlined style={{ color: '#ffb6d8' }} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: 16 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={searching}
            icon={<SearchOutlined />}
            style={{
              background: 'linear-gradient(90deg, #ff69b4 0%, #ff85c0 100%)',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(255, 105, 180, 0.3)'
            }}
          >
            搜索课程
          </Button>
        </Row>
      </Form>
    </Card>
  );
};
