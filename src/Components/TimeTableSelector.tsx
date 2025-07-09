// Components/TimeTableSelector.tsx - 时间表格选择器组件
import React, { useState, useCallback } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { ReloadOutlined, SwapOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { CourseTime } from 'Plugins/CourseManagementService/Objects/CourseTime';
import { DayOfWeek } from 'Plugins/CourseManagementService/Objects/DayOfWeek';
import { TimePeriod } from 'Plugins/CourseManagementService/Objects/TimePeriod';

export interface TimeTableSelectorProps {
  onChange?: (selectedTimes: boolean[][], courseTimesForAPI: CourseTime[]) => void;
  defaultSelected?: boolean;
}

export const TimeTableSelector: React.FC<TimeTableSelectorProps> = ({
  onChange,
  defaultSelected = true
}) => {
  // 6行7列的时间表格，默认全选
  const [timeTable, setTimeTable] = useState<boolean[][]>(() => 
    Array(6).fill(null).map(() => Array(7).fill(defaultSelected))
  );
  
  // 控制表格显示/隐藏状态
  const [isExpanded, setIsExpanded] = useState(false);

  // 时间标签 - 简化为中文数字
  const timeLabels = ['一', '二', '三', '四', '五', '六'];
  const timeTooltips = [
    '8:00-9:35',      // morning
    '9:50-12:15',     // lateMorning
    '13:30-15:05',    // earlyAfternoon
    '15:20-16:55',    // midAfternoon
    '17:05-18:40',    // lateAfternoon
    '19:20-21:45'     // evening
  ];
  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  // 时间段枚举映射
  const timePeriodMapping = [
    TimePeriod.morning,
    TimePeriod.lateMorning,
    TimePeriod.earlyAfternoon,
    TimePeriod.midAfternoon,
    TimePeriod.lateAfternoon,
    TimePeriod.evening
  ];

  // 星期枚举映射
  const dayOfWeekMapping = [
    DayOfWeek.monday,
    DayOfWeek.tuesday,
    DayOfWeek.wednesday,
    DayOfWeek.thursday,
    DayOfWeek.friday,
    DayOfWeek.saturday,
    DayOfWeek.sunday
  ];

  // 将时间表格转换为CourseTime数组
  const convertToCourseTimesForAPI = useCallback((timeTable: boolean[][]): CourseTime[] => {
    const courseTimes: CourseTime[] = [];
    for (let row = 0; row < timeTable.length; row++) {
      for (let col = 0; col < timeTable[row].length; col++) {
        if (timeTable[row][col]) {
          courseTimes.push(new CourseTime(
            dayOfWeekMapping[col],
            timePeriodMapping[row]
          ));
        }
      }
    }
    return courseTimes;
  }, []);

  // 初始化时调用onChange，确保默认状态能传递给父组件
  React.useEffect(() => {
    if (onChange) {
      const courseTimesForAPI = convertToCourseTimesForAPI(timeTable);
      onChange(timeTable, courseTimesForAPI);
    }
  }, []); // 只在组件挂载时执行一次

  // 切换单个格子的状态
  const toggleCell = useCallback((row: number, col: number) => {
    const newTimeTable = timeTable.map((timeRow, rowIndex) =>
      timeRow.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? !cell : cell
      )
    );
    setTimeTable(newTimeTable);
    const courseTimesForAPI = convertToCourseTimesForAPI(newTimeTable);
    onChange?.(newTimeTable, courseTimesForAPI);
  }, [timeTable, onChange, convertToCourseTimesForAPI]);

  // 全局反转
  const toggleAll = useCallback(() => {
    const newTimeTable = timeTable.map(row =>
      row.map(cell => !cell)
    );
    setTimeTable(newTimeTable);
    const courseTimesForAPI = convertToCourseTimesForAPI(newTimeTable);
    onChange?.(newTimeTable, courseTimesForAPI);
  }, [timeTable, onChange, convertToCourseTimesForAPI]);

  // 全局重置（全选）
  const resetAll = useCallback(() => {
    const newTimeTable = Array(6).fill(null).map(() => Array(7).fill(true));
    setTimeTable(newTimeTable);
    const courseTimesForAPI = convertToCourseTimesForAPI(newTimeTable);
    onChange?.(newTimeTable, courseTimesForAPI);
  }, [onChange, convertToCourseTimesForAPI]);

  // 计算选中的格子数量
  const selectedCount = timeTable.flat().filter(Boolean).length;
  const totalCount = 42; // 6 * 7

  return (
    <div style={{ 
      width: '100%',
      borderRadius: '8px',
      border: '1px solid rgba(255, 182, 216, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '8px'
    }}>
      {/* 展开/收起按钮 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isExpanded ? '8px' : '0',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <span style={{ 
          fontSize: '11px', 
          color: '#ff69b4', 
          fontWeight: 'bold' 
        }}>
          时间选择 ({selectedCount}/{totalCount})
        </span>
        {isExpanded ? <UpOutlined style={{ color: '#ff69b4', fontSize: '10px' }} /> : <DownOutlined style={{ color: '#ff69b4', fontSize: '10px' }} />}
      </div>

      {/* 时间表格 - 可展开/收起 */}
      {isExpanded && (
        <>
          <div style={{ marginBottom: '8px' }}>
            {/* 表头 - 星期 */}
            <div style={{ display: 'flex', marginBottom: '2px' }}>
              <div style={{ 
                width: '24px', 
                height: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#ff69b4'
              }}>
                节
              </div>
              {dayLabels.map((day, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(255, 182, 216, 0.15) 0%, rgba(255, 222, 237, 0.15) 100%)',
                    border: '1px solid rgba(255, 182, 216, 0.3)',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#d81b60',
                    margin: '0 1px'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* 时间行 */}
            {timeTable.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', marginBottom: '1px' }}>
                {/* 时间标签 */}
                <div style={{
                  width: '24px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(255, 182, 216, 0.15) 0%, rgba(255, 222, 237, 0.15) 100%)',
                  border: '1px solid rgba(255, 182, 216, 0.3)',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: '#d81b60'
                }}>
                  {timeLabels[rowIndex]}
                </div>
                
                {/* 时间格子 */}
                {row.map((selected, colIndex) => (
                  <Tooltip
                    key={colIndex}
                    title={`周${dayLabels[colIndex]} 第${timeLabels[rowIndex]}节 (${timeTooltips[rowIndex]}) ${selected ? '已选择' : '未选择'}`}
                    placement="top"
                  >
                    <div
                      style={{
                        flex: 1,
                        height: '20px',
                        border: '1px solid rgba(255, 182, 216, 0.3)',
                        borderRadius: '4px',
                        backgroundColor: selected 
                          ? 'linear-gradient(135deg, #ff69b4 0%, #ff85c0 100%)' 
                          : 'rgba(255, 255, 255, 0.8)',
                        background: selected 
                          ? 'linear-gradient(135deg, #ff69b4 0%, #ff85c0 100%)' 
                          : 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        color: selected ? '#ffffff' : '#999999',
                        margin: '0 1px',
                        boxShadow: selected 
                          ? '0 1px 2px rgba(255, 105, 180, 0.3)' 
                          : '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                      onClick={() => toggleCell(rowIndex, colIndex)}
                      onMouseEnter={(e) => {
                        if (!selected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 182, 216, 0.2)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {selected ? '✓' : ''}
                    </div>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <Space size="small" style={{ width: '100%', justifyContent: 'center' }}>
            <Button 
              icon={<SwapOutlined />} 
              size="small" 
              onClick={toggleAll}
              type="default"
              style={{
                borderRadius: '4px',
                border: '1px solid rgba(255, 105, 180, 0.3)',
                color: '#ff69b4',
                fontSize: '10px',
                height: '24px',
                padding: '0 8px'
              }}
            >
              反转
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              size="small" 
              onClick={resetAll}
              style={{
                borderRadius: '4px',
                background: 'linear-gradient(90deg, rgba(255, 105, 180, 0.1) 0%, rgba(255, 133, 192, 0.1) 100%)',
                border: '1px solid rgba(255, 105, 180, 0.3)',
                color: '#ff69b4',
                fontSize: '10px',
                height: '24px',
                padding: '0 8px'
              }}
            >
              重置
            </Button>
          </Space>
        </>
      )}
    </div>
  );
};

export default TimeTableSelector;
