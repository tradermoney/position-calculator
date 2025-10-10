/**
 * 快捷时间选择按钮组件
 */

import React from 'react';
import { Box, Button } from '@mui/material';

interface TimeShortcut {
  label: string;
  hours: number;
}

const TIME_SHORTCUTS: TimeShortcut[] = [
  { label: '4小时', hours: 4 },
  { label: '8小时', hours: 8 },
  { label: '1天', hours: 24 },
  { label: '3天', hours: 72 },
  { label: '1周', hours: 168 },
  { label: '2周', hours: 336 },
  { label: '3周', hours: 504 },
  { label: '1个月', hours: 720 },
  { label: '2个月', hours: 1440 },
  { label: '3个月', hours: 2160 },
  { label: '4个月', hours: 2880 },
  { label: '5个月', hours: 3600 },
  { label: '半年', hours: 4380 },
  { label: '1年', hours: 8760 },
];

interface TimeShortcutsButtonsProps {
  onSelectTime: (hours: number) => void;
  currentHours: number;
}

const TimeShortcutsButtons: React.FC<TimeShortcutsButtonsProps> = ({
  onSelectTime,
  currentHours,
}) => {
  // 按小时、天、周、月、年分组
  const hourShortcuts = TIME_SHORTCUTS.filter(s => s.label.includes('小时'));
  const dayShortcuts = TIME_SHORTCUTS.filter(s => s.label.includes('天') && !s.label.includes('周'));
  const weekShortcuts = TIME_SHORTCUTS.filter(s => s.label.includes('周'));
  const monthShortcuts = TIME_SHORTCUTS.filter(s => s.label.includes('个月'));
  const yearShortcuts = TIME_SHORTCUTS.filter(s => 
    (s.label.includes('半年') || s.label.includes('年')) && !s.label.includes('个月')
  );

  const renderButtons = (shortcuts: typeof TIME_SHORTCUTS) => (
    shortcuts.map((shortcut) => (
      <Button
        key={shortcut.hours}
        size="small"
        variant={currentHours === shortcut.hours ? 'contained' : 'outlined'}
        onClick={() => onSelectTime(shortcut.hours)}
        sx={{
          minWidth: '72px',
          width: '72px',
          px: 1,
          py: 0.5,
          fontSize: '0.75rem',
        }}
      >
        {shortcut.label}
      </Button>
    ))
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
      {/* 第一行：小时 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {renderButtons(hourShortcuts)}
      </Box>
      
      {/* 第二行：天 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {renderButtons(dayShortcuts)}
      </Box>
      
      {/* 第三行：周 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {renderButtons(weekShortcuts)}
      </Box>
      
      {/* 第四行：月 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {renderButtons(monthShortcuts)}
      </Box>
      
      {/* 第五行：年 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {renderButtons(yearShortcuts)}
      </Box>
    </Box>
  );
};

export default TimeShortcutsButtons;
