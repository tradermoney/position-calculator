import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

export default function Settings() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        设置
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
            设置页面功能正在开发中...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
