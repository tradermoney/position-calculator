import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Alert,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useKellyCalculator } from './hooks';
import {
  TabPanel,
  TradingParametersForm,
  HistoricalDataTable,
  RiskAdjustmentSettings,
  CalculationResult,
} from './components';

export default function KellyCalculator() {
  const {
    tabValue,
    setTabValue,
    winRate,
    setWinRate,
    avgWin,
    setAvgWin,
    avgLoss,
    setAvgLoss,
    trades,
    setTrades,
    riskAdjustment,
    setRiskAdjustment,
    result,
    errors,
    handleCalculate,
    handleReset,
  } = useKellyCalculator();

  return (
    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              凯利公式计算器
            </Typography>

            {/* 计算模式选择 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="交易参数模式" />
                <Tab label="历史数据分析" />
              </Tabs>
            </Box>

            {/* 交易参数模式 */}
            <TabPanel value={tabValue} index={0}>
              <TradingParametersForm
                winRate={winRate}
                avgWin={avgWin}
                avgLoss={avgLoss}
                onWinRateChange={setWinRate}
                onAvgWinChange={setAvgWin}
                onAvgLossChange={setAvgLoss}
              />
            </TabPanel>

            {/* 历史数据分析模式 */}
            <TabPanel value={tabValue} index={1}>
              <HistoricalDataTable trades={trades} onTradesChange={setTrades} />
            </TabPanel>

            <Divider sx={{ my: 3 }} />

            {/* 风险调整参数 */}
            <RiskAdjustmentSettings
              riskAdjustment={riskAdjustment}
              onRiskAdjustmentChange={setRiskAdjustment}
            />

            {/* 操作按钮 */}
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                fullWidth
              >
                计算
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                fullWidth
              >
                重置
              </Button>
            </Box>

            {/* 错误提示 */}
            {errors.length > 0 && (
              <Box mt={2}>
                {errors.map((error, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    {error}
                  </Alert>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 右侧：计算结果 */}
      <Grid item xs={12} md={4}>
        <CalculationResult result={result} />
      </Grid>
    </Grid>
  );
}
