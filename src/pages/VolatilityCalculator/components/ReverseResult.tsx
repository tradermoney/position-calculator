import React from 'react';
import { Typography } from '@mui/material';
import { ReverseCalculationResult } from '../types';
import { formatNumber } from '../utils/formatting';
import {
  CalculatorCard,
  ResultSection,
  ResultLabel,
  CalculationDetails,
} from '../../../styles/volatilityCalculator';

interface ReverseResultProps {
  result: ReverseCalculationResult;
}

export const ReverseResult: React.FC<ReverseResultProps> = ({ result }) => {
  return (
    <CalculatorCard>
      <Typography variant="h6" gutterBottom>
        计算结果
      </Typography>

      <ResultSection>
        {/* 价格波动范围 - 作为主要展示结果 */}
        <ResultLabel>价格波动范围</ResultLabel>
        <CalculationDetails style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '2px solid #2196f3' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>起始价格：</strong> {formatNumber(result.priceRange.startPrice, 4)} USDT
          </div>
          <div style={{ color: '#f44336', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '8px' }}>
            <strong>下限价格（下跌 {formatNumber(result.volatility, 2)}%）：</strong> {formatNumber(result.priceRange.lowerPrice, 4)} USDT
          </div>
          <div style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '12px' }}>
            <strong>上限价格（上涨 {formatNumber(result.volatility, 2)}%）：</strong> {formatNumber(result.priceRange.upperPrice, 4)} USDT
          </div>
          <div style={{ marginTop: '12px', fontSize: '1.2em', fontWeight: 'bold', color: '#1976d2', padding: '12px', backgroundColor: 'white', borderRadius: '4px' }}>
            <strong>波动区间：</strong> {formatNumber(result.priceRange.lowerPrice, 4)} ~ {formatNumber(result.priceRange.upperPrice, 4)} USDT
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.9em', color: '#666', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
            <strong>说明：</strong> 在 {formatNumber(result.volatility, 2)}% 的波动率下，价格从 {formatNumber(result.priceRange.startPrice, 4)} USDT 出发，可能上涨至 {formatNumber(result.priceRange.upperPrice, 4)} USDT 或下跌至 {formatNumber(result.priceRange.lowerPrice, 4)} USDT
          </div>
        </CalculationDetails>

        {/* 计算详情 - 折叠到次要位置 */}
        <CalculationDetails style={{ marginTop: '16px' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
            计算详情
          </Typography>
          <div><strong>波动率：</strong> {formatNumber(result.volatility, 2)}%</div>
          <div><strong>计算公式：</strong> 起始价格 × (1 ± 波动率/100)</div>
          <div><strong>详细计算：</strong> {result.formula}</div>
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
