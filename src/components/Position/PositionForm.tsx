import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Position, PositionSide } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { validatePosition } from '../../utils/calculations';

interface PositionFormProps {
  position?: Position | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function PositionForm({ position, onSubmit, onCancel }: PositionFormProps) {
  const { addPosition, updatePosition } = useAppContext();
  const [formData, setFormData] = useState({
    symbol: '',
    side: PositionSide.LONG,
    leverage: 10,
    entryPrice: '',
    quantity: '',
    margin: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 如果是编辑模式，填充表单数据
  useEffect(() => {
    if (position) {
      setFormData({
        symbol: position.symbol,
        side: position.side,
        leverage: position.leverage,
        entryPrice: position.entryPrice.toString(),
        quantity: position.quantity.toString(),
        margin: position.margin.toString(),
      });
    }
  }, [position]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // 清除错误信息
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    // 构建仓位对象
    const positionData: Partial<Position> = {
      symbol: formData.symbol.toUpperCase(),
      side: formData.side,
      leverage: formData.leverage,
      entryPrice: parseFloat(formData.entryPrice),
      quantity: parseFloat(formData.quantity),
      margin: parseFloat(formData.margin),
    };

    // 验证数据
    const validationErrors = validatePosition(positionData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (position) {
        // 编辑模式
        const updatedPosition: Position = {
          ...position,
          ...positionData as Position,
          updatedAt: new Date(),
        };
        updatePosition(updatedPosition);
      } else {
        // 创建模式
        const newPosition: Position = {
          id: Date.now().toString(),
          ...positionData as Position,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addPosition(newPosition);
      }

      onSubmit();
    } catch (error) {
      setErrors(['保存仓位时发生错误，请重试']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      symbol: '',
      side: PositionSide.LONG,
      leverage: 10,
      entryPrice: '',
      quantity: '',
      margin: '',
    });
    setErrors([]);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="币种符号"
            value={formData.symbol}
            onChange={handleInputChange('symbol')}
            placeholder="例如: BTC/USDT"
            required
            helperText="请输入交易对符号"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>仓位方向</InputLabel>
            <Select
              value={formData.side}
              label="仓位方向"
              onChange={handleSelectChange('side')}
            >
              <MenuItem value={PositionSide.LONG}>多头 (Long)</MenuItem>
              <MenuItem value={PositionSide.SHORT}>空头 (Short)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="杠杆倍数"
            type="number"
            value={formData.leverage}
            onChange={handleSelectChange('leverage')}
            inputProps={{ min: 1, max: 125, step: 1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">x</InputAdornment>,
            }}
            required
            helperText="1-125倍杠杆"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="开仓价格"
            type="number"
            value={formData.entryPrice}
            onChange={handleInputChange('entryPrice')}
            inputProps={{ min: 0, step: 'any' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            required
            helperText="开仓时的价格"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="持有数量"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange('quantity')}
            inputProps={{ min: 0, step: 'any' }}
            required
            helperText="持有的币种数量"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="保证金"
            type="number"
            value={formData.margin}
            onChange={handleInputChange('margin')}
            inputProps={{ min: 0, step: 'any' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            required
            helperText="投入的保证金金额"
          />
        </Grid>
      </Grid>

      <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          重置
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : (position ? '更新仓位' : '创建仓位')}
        </Button>
      </Box>
    </Box>
  );
}
