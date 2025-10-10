/**
 * 结果展示卡片组件
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import FieldTooltip from './FieldTooltip';
import { CalculationResult } from '../types';
import { FundingRateData, SymbolInfo } from '../../../services/binanceApi';
import { TOOLTIPS } from '../tooltips';

interface ResultCardProps {
  loading: boolean;
  result: CalculationResult | null;
  currentFundingRate: FundingRateData | null;
  fundingHistoryLength: number;
  longPositionSize: number;
  shortPositionSize: number;
  timeMode: 'historical' | 'future';
  symbolInfo: SymbolInfo | null;
}

const ResultCard: React.FC<ResultCardProps> = ({
  loading,
  result,
  currentFundingRate,
  fundingHistoryLength,
  longPositionSize,
  shortPositionSize,
  timeMode,
  symbolInfo,
}) => {
  const formatRate = (rate: number) => `${(rate * 100).toFixed(4)}%`;
  const formatCost = (cost: number) => {
    const sign = cost >= 0 ? '+' : '';
    return `${sign}${cost.toFixed(2)} USDT`;
  };
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const hasLongPosition = longPositionSize > 0;
  const hasShortPosition = shortPositionSize > 0;
  const isHedging = hasLongPosition && hasShortPosition;

  const resultTitle = timeMode === 'historical' ? '历史成本' : '预估结果';
  const costLabel = timeMode === 'historical' ? '实际资金费用' : '预估资金费用';
  const basisLabel = timeMode === 'historical' ? '基于历史实际费率' : '基于最近7天平均费率';

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {resultTitle}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : result ? (
          <Box sx={{ mt: 2 }}>
            {/* 仓位类型提示 */}
            {isHedging && (
              <Alert severity="info" sx={{ mb: 2 }}>
                您持有对冲仓位，净成本已考虑做多和做空的抵消效果
              </Alert>
            )}

            {/* 净成本（对冲仓位时显示） */}
            {isHedging && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: result.netCost < 0 ? 'error.light' : result.netCost > 0 ? 'success.light' : 'grey.100', 
                  mb: 2 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    净资金费用（对冲后）
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.netCost} />
                </Box>
                <Typography 
                  variant="h4" 
                  color={result.netCost < 0 ? 'error.dark' : result.netCost > 0 ? 'success.dark' : 'text.primary'} 
                  sx={{ mt: 1 }}
                >
                  {formatCost(result.netCost)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {basisLabel} | {result.netCost < 0 ? '净支出' : result.netCost > 0 ? '净收入' : '收支平衡'}
                </Typography>
              </Paper>
            )}

            {/* 做多仓位成本 */}
            {hasLongPosition && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: result.longCost < 0 ? 'error.light' : 'success.light', 
                  mb: 2 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    做多仓位资金费用
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.longCost} />
                </Box>
                <Typography 
                  variant="h5" 
                  color={result.longCost < 0 ? 'error.dark' : 'success.dark'} 
                  sx={{ mt: 1 }}
                >
                  {formatCost(result.longCost)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  仓位大小: {longPositionSize} USDT | {result.longCost < 0 ? '支出' : '收入'}
                </Typography>
              </Paper>
            )}

            {/* 做空仓位成本 */}
            {hasShortPosition && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: result.shortCost < 0 ? 'error.light' : 'success.light', 
                  mb: 2 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    做空仓位资金费用
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.shortCost} />
                </Box>
                <Typography 
                  variant="h5" 
                  color={result.shortCost < 0 ? 'error.dark' : 'success.dark'} 
                  sx={{ mt: 1 }}
                >
                  {formatCost(result.shortCost)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  仓位大小: {shortPositionSize} USDT | {result.shortCost < 0 ? '支出' : '收入'}
                </Typography>
              </Paper>
            )}

            {/* 总成本（非对冲仓位时显示） */}
            {!isHedging && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: result.totalCost < 0 ? 'error.light' : result.totalCost > 0 ? 'success.light' : 'grey.100', 
                  mb: 2 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {costLabel}
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.totalCost} />
                </Box>
                <Typography 
                  variant="h4" 
                  color={result.totalCost < 0 ? 'error.dark' : result.totalCost > 0 ? 'success.dark' : 'text.primary'} 
                  sx={{ mt: 1 }}
                >
                  {formatCost(result.totalCost)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {basisLabel} | {result.totalCost < 0 ? '支出' : result.totalCost > 0 ? '收入' : '收支平衡'}
                </Typography>
              </Paper>
            )}

            <Divider sx={{ my: 2 }} />

            {/* 资金费率统计 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    当前资金费率
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.currentRate} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="h6">
                    {formatRate(result.currentRate)}
                  </Typography>
                  <Chip
                    label={result.currentRate > 0 ? '做多付费' : '做空付费'}
                    color={result.currentRate > 0 ? 'error' : 'success'}
                    size="small"
                  />
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    7天平均费率
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.avg7Days} />
                </Box>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {formatRate(result.avgRate7d)}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    30天平均费率
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.avg30Days} />
                </Box>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {formatRate(result.avgRate)}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    资金费率周期数
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.periods} />
                </Box>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {result.periods} 个
                </Typography>
              </Box>

              {symbolInfo && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      结算周期
                    </Typography>
                    <FieldTooltip title={TOOLTIPS.fundingInterval} />
                  </Box>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    每 {symbolInfo.fundingIntervalHours} 小时
                  </Typography>
                </Box>
              )}

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    数据点数量
                  </Typography>
                  <FieldTooltip title={TOOLTIPS.dataPoints} />
                </Box>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {fundingHistoryLength} 个
                </Typography>
              </Box>

              {currentFundingRate && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      下次结算时间
                    </Typography>
                    <FieldTooltip title={TOOLTIPS.nextSettlement} />
                  </Box>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {formatDate(currentFundingRate.fundingTime)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              请输入计算参数
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultCard;

