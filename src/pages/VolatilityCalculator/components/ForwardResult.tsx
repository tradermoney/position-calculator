import React from 'react';
import { Typography } from '@mui/material';
import { VolatilityResult } from '../types';
import { formatNumber } from '../utils/formatting';
import {
  CalculatorCard,
  ResultSection,
  ResultLabel,
  VolatilityResult as VolatilityResultStyled,
  CalculationDetails,
} from '../../../styles/volatilityCalculator';

interface ForwardResultProps {
  result: VolatilityResult;
}

export const ForwardResult: React.FC<ForwardResultProps> = ({ result }) => {
  return (
    <CalculatorCard>
      <Typography variant="h6" gutterBottom>
        计算结果
      </Typography>

      <ResultSection>
        <ResultLabel>波动率</ResultLabel>
        <VolatilityResultStyled
          color={result.sign === '+' ? 'positive' : 'negative'}
        >
          {result.sign}{formatNumber(result.volatility, 2)}%
        </VolatilityResultStyled>

        <CalculationDetails>
          <div><strong>计算公式：</strong> |目标价格 - 起始价格| ÷ max(起始价格, 目标价格) × 100</div>
          <div><strong>详细计算：</strong> {result.formula}</div>
          <div><strong>价格差值：</strong> {formatNumber(result.difference)}</div>
          <div><strong>基准价格：</strong> {formatNumber(result.maxPrice)}</div>
          <div><strong>变化方向：</strong> {result.sign === '+' ? '上涨（目标价格 > 起始价格）' : '下跌（目标价格 < 起始价格）'}</div>
        </CalculationDetails>

        {/* 投资金额波动分析 */}
        {result.investmentVolatility && (
          <CalculationDetails style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              投资金额波动分析
            </Typography>
            <div><strong>投资金额：</strong> {formatNumber(result.investmentVolatility.amount, 2)} USDT</div>
            <div><strong>波动金额：</strong> {formatNumber(result.investmentVolatility.volatilityAmount, 2)} USDT</div>
            <div><strong>波动区间：</strong> {formatNumber(result.investmentVolatility.lowerBound, 2)} ~ {formatNumber(result.investmentVolatility.upperBound, 2)} USDT</div>
            <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
              <strong>说明：</strong> 在当前 {formatNumber(result.volatility, 2)}% 的波动率下，您的 {formatNumber(result.investmentVolatility.amount, 2)} USDT 投资可能波动 ±{formatNumber(result.investmentVolatility.volatilityAmount, 2)} USDT
            </div>
          </CalculationDetails>
        )}
      </ResultSection>
    </CalculatorCard>
  );
};
