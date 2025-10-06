import React from 'react';
import {
  Grid,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

interface TradingParametersFormProps {
  winRate: number;
  avgWin: number;
  avgLoss: number;
  onWinRateChange: (value: number) => void;
  onAvgWinChange: (value: number) => void;
  onAvgLossChange: (value: number) => void;
}

export function TradingParametersForm({
  winRate,
  avgWin,
  avgLoss,
  onWinRateChange,
  onAvgWinChange,
  onAvgLossChange,
}: TradingParametersFormProps) {
  return (
    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="胜率 (%)"
          type="text"
          value={winRate || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
              const numValue = parseFloat(value) || 0;
              if (numValue >= 0 && numValue <= 100) {
                onWinRateChange(numValue);
              }
            }
          }}
          helperText="获胜交易的概率"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="获胜交易占总交易次数的百分比。例如：100次交易中有60次盈利，胜率为60%">
                  <IconButton size="small" edge="end">
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="平均盈利"
          type="text"
          value={avgWin || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
              onAvgWinChange(parseFloat(value) || 0);
            }
          }}
          helperText="每次盈利交易的平均收益"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="所有盈利交易的平均金额。例如：3次盈利分别为100、150、200元，平均盈利为150元">
                  <IconButton size="small" edge="end">
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="平均亏损"
          type="text"
          value={avgLoss || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
              onAvgLossChange(parseFloat(value) || 0);
            }
          }}
          helperText="每次亏损交易的平均损失"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="所有亏损交易的平均金额（绝对值）。例如：2次亏损分别为-30、-50元，平均亏损为40元">
                  <IconButton size="small" edge="end">
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
}
