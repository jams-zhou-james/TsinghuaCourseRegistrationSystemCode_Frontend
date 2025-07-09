// CourseSearchForm.tsx
import React, { useState, useCallback } from 'react';
import { Form, Input, Button, Row, Col, Card, Space } from 'antd';
import { SearchOutlined, BookOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { TimeTableSelector } from '../../../Components/TimeTableSelector';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';

interface CourseSearchFormProps {
  onSearch: (filter?: { 
    courseName?: string; 
    courseID?: string; 
    teacherID?: string; 
    allowedTimePeriods?: CourseTime[]
  }) => void;
}

export const CourseSearchForm: React.FC<CourseSearchFormProps> = ({ 
  onSearch
}) => {
  const [form] = Form.useForm();
  const [searching, setSearching] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<CourseTime[]>([]);

  // 处理时间表格选择器的变化
  const handleTimeTableChange = useCallback((timeTable: boolean[][], courseTimesForAPI: CourseTime[]) => {
    setSelectedTimeSlots(courseTimesForAPI);
  }, []);

  const handleSearch = async (values: any) => {
    setSearching(true);
    try {
      await onSearch({
        courseName: values.courseName,
        courseID: values.courseID,
        teacherID: values.teacherID,
        allowedTimePeriods: selectedTimeSlots
      });
    } finally {
      setSearching(false);
    }
  };
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
      <Form form={form} layout="vertical" onFinish={handleSearch}>
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
            <Form.Item name="teacherID" label="授课教师">
              <Input 
                placeholder="请输入教师姓名" 
                prefix={<UserOutlined style={{ color: '#ffb6d8' }} />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label={
              <Space>
                <ClockCircleOutlined style={{ color: '#ffb6d8' }} />
                <span>上课时间</span>
                <span style={{ color: '#666', fontSize: '11px' }}>
                  ({selectedTimeSlots.length}个)
                </span>
              </Space>
            }>
              <TimeTableSelector 
                onChange={handleTimeTableChange}
                defaultSelected={true}
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
