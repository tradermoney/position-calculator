import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

interface TooltipIconProps {
  title: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium';
}

export default function TooltipIcon({ 
  title, 
  placement = 'top',
  size = 'small'
}: TooltipIconProps) {
  return (
    <Tooltip title={title} placement={placement} arrow>
      <IconButton 
        size={size} 
        sx={{ 
          p: 0.5, 
          ml: 0.5,
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <HelpIcon fontSize="inherit" color="action" />
      </IconButton>
    </Tooltip>
  );
}
