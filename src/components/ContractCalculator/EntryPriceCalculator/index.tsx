import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { PositionSide } from '../../../utils/contractCalculations';
import { useEntryPriceForm } from './useEntryPriceForm';
import { PositionListTable } from './PositionListTable';
import { CalculationResultPanel } from './CalculationResultPanel';
import { validateNumberInput } from './utils';

export default function EntryPriceCalculator() {
  const {
    side,
    setSide,
    currentPrice,
    setCurrentPrice,
    positions,
    setPositions,
    result,
    errors,
    setInputValues,
    handleCalculate,
    handleReset,
    addPosition,
    insertPosition,
    removePosition,
    handleInputChange,
    getInputValue,
    updatePosition,
  } = useEntryPriceForm();

  return (
    <Grid container spacing={3}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} lg={9}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              仓位信息
            </Typography>

            {/* 仓位方向 */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                仓位方向
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant={side === PositionSide.LONG ? 'contained' : 'outlined'}
                  color="success"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => setSide(PositionSide.LONG)}
                  sx={{ flex: 1 }}
                >
                  做多
                </Button>
                <Button
                  variant={side === PositionSide.SHORT ? 'contained' : 'outlined'}
                  color="error"
                  startIcon={<TrendingDownIcon />}
                  onClick={() => setSide(PositionSide.SHORT)}
                  sx={{ flex: 1 }}
                >
                  做空
                </Button>
              </Box>
            </Box>

            {/* 当前价格 */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                当前价格（可选）
              </Typography>
              <TextField
                size="small"
                type="text"
                value={getInputValue(0, 'price', currentPrice)}
                onChange={(e) => {
                  const value = e.target.value;
                  const numberRegex = /^\d*\.?\d*$/;
                  if (value === '' || numberRegex.test(value)) {
                    setInputValues((prev) => ({ ...prev, '0-price': value }));
                    setCurrentPrice(validateNumberInput(value));
                  }
                }}
                placeholder="输入当前价格以计算波动率"
                fullWidth
                inputProps={{
                  pattern: '[0-9]*\\.?[0-9]*',
                  inputMode: 'decimal',
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
                }}
                helperText="输入当前价格后，将显示每个仓位相对于当前价格的波动率"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 仓位列表 */}
            <PositionListTable
              positions={positions}
              currentPrice={currentPrice}
              setPositions={setPositions}
              addPosition={addPosition}
              insertPosition={insertPosition}
              removePosition={removePosition}
              getInputValue={getInputValue}
              handleInputChange={handleInputChange}
              updatePosition={updatePosition}
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
                sx={{ whiteSpace: 'nowrap' }}
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
      <Grid item xs={12} lg={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              计算结果
            </Typography>
            <CalculationResultPanel result={result} side={side} positions={positions} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
