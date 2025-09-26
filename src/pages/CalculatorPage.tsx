import React from 'react';
import { Typography, Container } from '@mui/material';
import { usePageTitle } from '../utils/titleManager';
import Calculator from '../components/Calculator/Calculator';

export default function CalculatorPage() {
  usePageTitle('calculator');

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        计算器
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        支持基础运算和括号运算的科学计算器，自动保存计算历史记录
      </Typography>
      
      <Calculator />
    </Container>
  );
}
