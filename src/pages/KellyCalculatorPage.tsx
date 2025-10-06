import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { TrendingUp as KellyIcon } from '@mui/icons-material';
import KellyCalculator from '../components/KellyCalculator';
import { usePageTitle } from '../utils/titleManager';

export default function KellyCalculatorPage() {
  // 设置页面标题
  usePageTitle('kelly-calculator');

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* 页面标题 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <KellyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              凯利公式计算器
            </Typography>
            <Typography variant="body1" color="text.secondary">
              使用凯利公式计算最优仓位比例
            </Typography>
          </Box>
        </Box>

        {/* 主要内容 */}
        <KellyCalculator />
      </Box>
    </Container>
  );
}
