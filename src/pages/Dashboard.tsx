import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useAppContext } from '../contexts/AppContext';
import { usePageTitle } from '../utils/titleManager';

export default function Dashboard() {
  const { state } = useAppContext();

  // 设置页面标题
  usePageTitle('dashboard');

  const activePositions = state.positions.filter(p => p.status === 'active');
  const totalPositions = state.positions.length;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        仪表盘
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                总仓位数
              </Typography>
              <Typography variant="h4" component="div">
                {totalPositions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                活跃仓位
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {activePositions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                欢迎使用仓位计算器
              </Typography>
              <Typography variant="body1" color="textSecondary">
                这是一个专业的加密货币仓位管理工具，支持仓位创建、补仓计算、金字塔加仓等功能。
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
