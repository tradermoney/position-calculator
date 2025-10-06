import React from 'react';
import { Box } from '@mui/material';
import { TabPanelProps } from '../types';

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kelly-tabpanel-${index}`}
      aria-labelledby={`kelly-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}
