/**
 * 字段提示组件
 * 提供统一的问号图标和详细说明
 */

import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface FieldTooltipProps {
  title: string | React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
}

const FieldTooltip: React.FC<FieldTooltipProps> = ({ title, placement = 'top' }) => {
  return (
    <Tooltip 
      title={title} 
      placement={placement}
      arrow
      enterDelay={200}
      leaveDelay={0}
    >
      <IconButton 
        size="small" 
        sx={{ 
          ml: 0.5, 
          p: 0.25,
          '&:hover': {
            backgroundColor: 'action.hover',
          }
        }}
      >
        <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
      </IconButton>
    </Tooltip>
  );
};

export default FieldTooltip;

