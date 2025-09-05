import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

export default function AddPositionCalculator() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        补仓计算器
      </Typography>
      
      <Card>
        <CardContent>
          <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
            补仓计算器功能正在开发中...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
