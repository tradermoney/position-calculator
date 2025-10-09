import React from 'react';
import { Box, TextField, Typography, Slider, Stack } from '@mui/material';
import { FeeComparisonInput } from '../types';

interface InputFormProps {
  input: FeeComparisonInput;
  onChange: (input: FeeComparisonInput) => void;
  errors: string[];
}

export default function InputForm({ input, onChange, errors }: InputFormProps) {
  const handleChange = (field: keyof FeeComparisonInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value) || 0;
    onChange({ ...input, [field]: value });
  };

  const handleMakerRatioChange = (_event: Event, value: number | number[]) => {
    const makerRatio = Array.isArray(value) ? value[0] : value;
    onChange({
      ...input,
      makerRatio,
      takerRatio: 100 - makerRatio,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        交易参数设置
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="交易金额 (USDT)"
          type="number"
          value={input.tradeAmount || ''}
          onChange={handleChange('tradeAmount')}
          fullWidth
          placeholder="请输入交易金额"
          inputProps={{ step: 0.01, min: 0 }}
        />

        <TextField
          label="杠杆倍数"
          type="number"
          value={input.leverage || ''}
          onChange={handleChange('leverage')}
          fullWidth
          placeholder="请输入杠杆倍数"
          inputProps={{ step: 1, min: 1, max: 125 }}
        />

        <Box>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            订单类型比例分配
          </Typography>
          <Box sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Maker: {input.makerRatio.toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taker: {input.takerRatio.toFixed(0)}%
              </Typography>
            </Box>
            <Slider
              value={input.makerRatio}
              onChange={handleMakerRatioChange}
              min={0}
              max={100}
              step={1}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              sx={{
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem',
                },
              }}
            />
          </Box>
        </Box>

        {errors.length > 0 && (
          <Box
            sx={{
              p: 2,
              backgroundColor: 'error.light',
              borderRadius: 1,
              color: 'error.contrastText',
            }}
          >
            {errors.map((error, index) => (
              <Typography key={index} variant="body2">
                • {error}
              </Typography>
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
}


