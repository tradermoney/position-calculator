/**
 * 数据配置表单组件
 * 直接展开所有配置项，不使用列表和对话框
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { PromptDataConfig } from '../../../utils/storage/types';
import { BinanceMarketDataAPI } from '../../../services/binance';

interface DataConfigFormProps {
  configs: PromptDataConfig[];
  onChange: (configs: PromptDataConfig[]) => void;
}

export function DataConfigForm({ configs, onChange }: DataConfigFormProps) {
  // 交易对列表
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);

  // 从configs中提取各个配置
  const symbolConfig = configs.find(c => c.type === 'symbol');
  const klineConfig = configs.find(c => c.type === 'kline');
  const fundingRateConfig = configs.find(c => c.type === 'fundingRate');
  const orderBookConfig = configs.find(c => c.type === 'orderBook');

  // 加载交易对列表
  useEffect(() => {
    loadSymbols();
  }, []);

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

  // 更新配置的辅助函数
  const updateConfig = (type: 'symbol' | 'kline' | 'fundingRate' | 'orderBook', updates: Partial<PromptDataConfig>) => {
    const newConfigs = [...configs];
    const existingIndex = newConfigs.findIndex(c => c.type === type);
    
    if (existingIndex >= 0) {
      // 更新现有配置
      newConfigs[existingIndex] = {
        ...newConfigs[existingIndex],
        ...updates,
      };
    } else {
      // 创建新配置
      newConfigs.push({
        id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        ...updates,
      });
    }
    
    onChange(newConfigs);
  };

  // 删除配置
  const removeConfig = (type: 'symbol' | 'kline' | 'fundingRate' | 'orderBook') => {
    const newConfigs = configs.filter(c => c.type !== type);
    onChange(newConfigs);
  };

  // 切换数据源启用状态
  const toggleDataSource = (type: 'kline' | 'fundingRate' | 'orderBook', enabled: boolean) => {
    if (enabled) {
      // 启用：创建默认配置
      const symbol = symbolConfig?.symbol || '';
      switch (type) {
        case 'kline':
          updateConfig('kline', { symbol, interval: '3m', limit: 500 });
          break;
        case 'fundingRate':
          updateConfig('fundingRate', { symbol, days: 3 });
          break;
        case 'orderBook':
          updateConfig('orderBook', { 
            symbol, 
            aggregationLevels: 20,  // 默认20档
          });
          break;
      }
    } else {
      // 禁用：删除配置
      removeConfig(type);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 交易对配置 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          交易对
        </Typography>
        <Autocomplete
          value={symbolConfig?.symbol || null}
          onChange={(event, newValue) => {
            // 只在用户明确选择或清除时更新
            // 注意：失去焦点时不应该触发清空操作
            if (newValue) {
              // 一次性更新所有相关配置
              const newConfigs = [...configs];
              
              // 更新或创建 symbol 配置
              const symbolIndex = newConfigs.findIndex(c => c.type === 'symbol');
              if (symbolIndex >= 0) {
                newConfigs[symbolIndex] = { ...newConfigs[symbolIndex], symbol: newValue };
              } else {
                newConfigs.push({
                  id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  type: 'symbol',
                  symbol: newValue,
                });
              }
              
              // 同步更新所有其他数据源的交易对
              for (let i = 0; i < newConfigs.length; i++) {
                const config = newConfigs[i];
                if (config.type === 'kline' || config.type === 'fundingRate' || config.type === 'orderBook') {
                  newConfigs[i] = { ...config, symbol: newValue };
                }
              }
              
              onChange(newConfigs);
            }
            // 移除了 else 分支，不再在 newValue 为 null 时删除配置
            // 这样可以防止失去焦点时清空已选择的值
          }}
          options={symbols}
          loading={loadingSymbols}
          isOptionEqualToValue={(option, value) => option === value}
          freeSolo={false}
          clearOnBlur={false}
          selectOnFocus={true}
          renderInput={(params) => (
            <TextField
              {...params}
              label="选择交易对"
              placeholder="例如: BTCUSDT"
              helperText="选择要分析的交易对，将应用于所有数据源"
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
      </Paper>

      {/* K线数据配置 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!klineConfig}
                onChange={(e) => toggleDataSource('kline', e.target.checked)}
              />
            }
            label={<Typography variant="h6">K线数据</Typography>}
          />
        </Box>
        
        {klineConfig && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>时间粒度</InputLabel>
              <Select
                value={klineConfig.interval || '1h'}
                label="时间粒度"
                onChange={(e) => updateConfig('kline', { interval: e.target.value })}
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
              value={klineConfig.limit || 500}
              onChange={(e) => updateConfig('kline', { limit: parseInt(e.target.value) || 500 })}
              inputProps={{ min: 1, max: 1500 }}
              helperText="获取最近多少根K线（最大1500）"
            />
          </Box>
        )}
      </Paper>

      {/* 资金费率配置 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!fundingRateConfig}
                onChange={(e) => toggleDataSource('fundingRate', e.target.checked)}
              />
            }
            label={<Typography variant="h6">资金费率</Typography>}
          />
        </Box>
        
        {fundingRateConfig && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="天数"
              value={fundingRateConfig.days || 3}
              onChange={(e) => updateConfig('fundingRate', { days: parseInt(e.target.value) || 3 })}
              inputProps={{ min: 1, max: 30 }}
              helperText="获取最近多少天的资金费率数据（每8小时一条）"
            />
          </Box>
        )}
      </Paper>

      {/* 订单薄配置（简化版）*/}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!orderBookConfig}
                onChange={(e) => toggleDataSource('orderBook', e.target.checked)}
              />
            }
            label={<Typography variant="h6">订单薄</Typography>}
          />
        </Box>
        
        {orderBookConfig && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="聚合档位数"
              value={orderBookConfig.aggregationLevels ?? 20}
              onChange={(e) => updateConfig('orderBook', { aggregationLevels: parseInt(e.target.value) || 20 })}
              inputProps={{ min: 10, max: 100, step: 10 }}
              helperText="将订单薄数据聚合为指定档位数量"
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              ℹ️ 注意：由于期货API限制，最多获取1000档订单数据（价格范围约±0.5%），本工具会将这些数据聚合为指定的档位数量。
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

