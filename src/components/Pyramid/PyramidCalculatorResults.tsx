/**
 * 金字塔加仓计算器结果显示组件
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import { PyramidResult } from '../../types/pyramid';
import { formatNumber, formatPercentage, exportPyramidPlan } from '../../utils/pyramidCalculations';
import PyramidCalculatorTable from './PyramidCalculatorTable';

interface PyramidCalculatorResultsProps {
  result: PyramidResult | null;
  errors: string[];
}

export default function PyramidCalculatorResults({
  result,
  errors,
}: PyramidCalculatorResultsProps) {
  if (errors.length > 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            参数验证错误
          </Typography>
          {errors.map((error, index) => (
            <Alert key={index} severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={300}
          >
            <Typography variant="body1" color="textSecondary">
              请配置策略参数并点击计算
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            分批建仓方案
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportPyramidPlan(result)}
            size="small"
          >
            导出方案
          </Button>
        </Box>

        {/* 策略概览 */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(25,118,210,0.1)', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                建仓档位
              </Typography>
              <Typography variant="h6">
                {result.levels.length}档
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                总持仓量
              </Typography>
              <Typography variant="h6">
                {formatNumber(result.totalQuantity)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(255,152,0,0.1)', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                总保证金
              </Typography>
              <Typography variant="h6">
                ${formatNumber(result.totalMargin, 2)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(156,39,176,0.1)', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                持仓均价
              </Typography>
              <Typography variant="h6">
                ${formatNumber(result.finalAveragePrice)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 风险指标 */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(244,67,54,0.1)', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                强平价格
              </Typography>
              <Typography variant="h6" color="error.main">
                ${formatNumber(result.finalLiquidationPrice)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(255,193,7,0.1)', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                最大回撤
              </Typography>
              <Typography variant="h6" color="warning.main">
                {formatPercentage(result.maxDrawdown)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 详细建仓方案表格 */}
        <PyramidCalculatorTable levels={result.levels} />
      </CardContent>
    </Card>
  );
}
