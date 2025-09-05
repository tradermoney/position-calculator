import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

export default function PyramidCalculator() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        金字塔加仓计算器
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
            金字塔加仓计算器功能正在开发中...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
