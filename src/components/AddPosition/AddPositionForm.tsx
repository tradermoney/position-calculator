/**
 * 补仓参数输入表单组件
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Position, PositionSide, AddPositionParams } from '../../types/addPosition';

interface AddPositionFormProps {
  activePositions: Position[];
  selectedPositionId: string;
  selectedPosition: Position | undefined;
  addParams: AddPositionParams;
  errors: string[];
  onPositionSelect: (positionId: string) => void;
  onParamsChange: (params: AddPositionParams) => void;
  onCalculate: () => void;
  onReset: () => void;
}

/**
 * 格式化数字
 */
const formatNumber = (value: number, decimals: number = 4): string => {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
};

export default function AddPositionForm({
  activePositions,
  selectedPositionId,
  selectedPosition,
  addParams,
  errors,
  onPositionSelect,
  onParamsChange,
  onCalculate,
  onReset,
}: AddPositionFormProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          补仓参数设置
        </Typography>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>选择仓位</InputLabel>
              <Select
                value={selectedPositionId}
                label="选择仓位"
                onChange={(e) => onPositionSelect(e.target.value)}
              >
                {activePositions.length === 0 ? (
                  <MenuItem disabled>暂无活跃仓位</MenuItem>
                ) : (
                  activePositions.map((position) => (
                    <MenuItem key={position.id} value={position.id}>
                      {position.symbol} - {position.side === PositionSide.LONG ? '多头' : '空头'} - {position.leverage}x
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {selectedPosition && (
            <>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    当前仓位信息
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        开仓价格
                      </Typography>
                      <Typography variant="body1">
                        ${formatNumber(selectedPosition.entryPrice)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        持有数量
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(selectedPosition.quantity)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        保证金
                      </Typography>
                      <Typography variant="body1">
                        ${formatNumber(selectedPosition.margin, 2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        方向
                      </Typography>
                      <Chip
                        label={selectedPosition.side === PositionSide.LONG ? '多头' : '空头'}
                        color={selectedPosition.side === PositionSide.LONG ? 'success' : 'error'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="补仓价格"
                  type="number"
                  value={addParams.addPrice || ''}
                  onChange={(e) => onParamsChange({
                    ...addParams,
                    addPrice: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 'any' }}
                  required
                  helperText="建议低于开仓价格（多头）或高于开仓价格（空头）"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="补仓数量"
                  type="number"
                  value={addParams.addQuantity || ''}
                  onChange={(e) => onParamsChange({
                    ...addParams,
                    addQuantity: parseFloat(e.target.value) || 0
                  })}
                  inputProps={{ min: 0, step: 'any' }}
                  required
                  helperText="增加的持有数量"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="补仓保证金"
                  type="number"
                  value={addParams.addMargin || ''}
                  onChange={(e) => onParamsChange({
                    ...addParams,
                    addMargin: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 'any' }}
                  required
                  helperText="补仓所需的额外保证金"
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={onCalculate}
            disabled={!selectedPosition}
            fullWidth
          >
            计算补仓结果
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
          >
            重置
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
