/**
 * 添加数据配置对话框
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { PromptDataConfig, PromptDataType } from '../../../utils/storage/types';
import { BinanceMarketDataAPI } from '../../../services/binance';

interface AddDataConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (config: PromptDataConfig) => void;
}

export function AddDataConfigDialog({ open, onClose, onAdd }: AddDataConfigDialogProps) {
  const [type, setType] = useState<PromptDataType>('symbol');
  const [symbol, setSymbol] = useState<string>('');
  const [interval, setInterval] = useState<string>('1m');
  const [limit, setLimit] = useState<number>(1000);
  const [days, setDays] = useState<number>(3);
  const [depth, setDepth] = useState<number>(20);

  // 交易对列表
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);

  // 加载交易对列表
  useEffect(() => {
    if (open) {
      loadSymbols();
    }
  }, [open]);

  const loadSymbols = async () => {
    setLoadingSymbols(true);
    try {
      const api = new BinanceMarketDataAPI();
      const exchangeInfo = await api.getExchangeInfo();
      const symbolList = exchangeInfo.symbols
        .filter((s: any) => s.status === 'TRADING')
        .map((s: any) => s.symbol);
      setSymbols(symbolList);
    } catch (error) {
      console.error('加载交易对列表失败:', error);
    } finally {
      setLoadingSymbols(false);
    }
  };

  const handleAdd = () => {
    const config: PromptDataConfig = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
    };

    // 根据类型设置相应的配置
    if (type === 'symbol' || type === 'kline' || type === 'fundingRate' || type === 'orderBook') {
      if (symbol) {
        config.symbol = symbol;
      }
    }

    if (type === 'kline') {
      config.interval = interval;
      config.limit = limit;
    }

    if (type === 'fundingRate') {
      config.days = days;
    }

    if (type === 'orderBook') {
      config.depth = depth;
    }

    onAdd(config);
    handleClose();
  };

  const handleClose = () => {
    // 重置表单
    setType('symbol');
    setSymbol('');
    setInterval('1m');
    setLimit(1000);
    setDays(3);
    setDepth(20);
    onClose();
  };

  const isValid = () => {
    // 所有类型都需要交易对
    if (type === 'symbol' || type === 'kline' || type === 'fundingRate' || type === 'orderBook') {
      return symbol.trim() !== '';
    }
    return true;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加数据配置</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* 数据类型选择 */}
          <FormControl fullWidth>
            <InputLabel>数据类型</InputLabel>
            <Select
              value={type}
              label="数据类型"
              onChange={(e) => setType(e.target.value as PromptDataType)}
            >
              <MenuItem value="symbol">交易对</MenuItem>
              <MenuItem value="kline">K线数据</MenuItem>
              <MenuItem value="fundingRate">资金费率</MenuItem>
              <MenuItem value="orderBook">订单薄</MenuItem>
            </Select>
          </FormControl>

          {/* 交易对选择 */}
          {(type === 'symbol' || type === 'kline' || type === 'fundingRate' || type === 'orderBook') && (
            <Autocomplete
              value={symbol}
              onChange={(_, newValue) => setSymbol(newValue || '')}
              options={symbols}
              loading={loadingSymbols}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="交易对"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSymbols ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          {/* K线配置 */}
          {type === 'kline' && (
            <>
              <FormControl fullWidth>
                <InputLabel>时间粒度</InputLabel>
                <Select
                  value={interval}
                  label="时间粒度"
                  onChange={(e) => setInterval(e.target.value)}
                >
                  <MenuItem value="1m">1分钟</MenuItem>
                  <MenuItem value="3m">3分钟</MenuItem>
                  <MenuItem value="5m">5分钟</MenuItem>
                  <MenuItem value="15m">15分钟</MenuItem>
                  <MenuItem value="30m">30分钟</MenuItem>
                  <MenuItem value="1h">1小时</MenuItem>
                  <MenuItem value="2h">2小时</MenuItem>
                  <MenuItem value="4h">4小时</MenuItem>
                  <MenuItem value="6h">6小时</MenuItem>
                  <MenuItem value="8h">8小时</MenuItem>
                  <MenuItem value="12h">12小时</MenuItem>
                  <MenuItem value="1d">1天</MenuItem>
                  <MenuItem value="3d">3天</MenuItem>
                  <MenuItem value="1w">1周</MenuItem>
                  <MenuItem value="1M">1月</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="数据点数"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 1000)}
                inputProps={{ min: 1, max: 1500 }}
              />
            </>
          )}

          {/* 资金费率配置 */}
          {type === 'fundingRate' && (
            <TextField
              fullWidth
              type="number"
              label="天数"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 3)}
              inputProps={{ min: 1, max: 30 }}
            />
          )}

          {/* 订单薄配置 */}
          {type === 'orderBook' && (
            <FormControl fullWidth>
              <InputLabel>档位</InputLabel>
              <Select
                value={depth}
                label="档位"
                onChange={(e) => setDepth(e.target.value as number)}
              >
                <MenuItem value={5}>5档</MenuItem>
                <MenuItem value={10}>10档</MenuItem>
                <MenuItem value={20}>20档</MenuItem>
                <MenuItem value={50}>50档</MenuItem>
                <MenuItem value={100}>100档</MenuItem>
                <MenuItem value={500}>500档</MenuItem>
                <MenuItem value={1000}>1000档</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!isValid()}>
          添加
        </Button>
      </DialogActions>
    </Dialog>
  );
}


