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
  Switch,
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
            orderBookMode: 'priceRange',
            priceRangePercent: 10,
            aggregationEnabled: true,
            aggregationLevels: 20,
            aggregationMode: 'equal-price'
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
          value={symbolConfig?.symbol || ''}
          onChange={(_, newValue) => {
            if (newValue) {
              updateConfig('symbol', { symbol: newValue });
              // 同步更新其他数据源的交易对
              if (klineConfig) {
                updateConfig('kline', { symbol: newValue });
              }
              if (fundingRateConfig) {
                updateConfig('fundingRate', { symbol: newValue });
              }
              if (orderBookConfig) {
                updateConfig('orderBook', { symbol: newValue });
              }
            } else {
              removeConfig('symbol');
            }
          }}
          options={symbols}
          loading={loadingSymbols}
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

      {/* 订单薄配置 */}
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
            <FormControl fullWidth>
              <InputLabel>显示模式</InputLabel>
              <Select
                value={orderBookConfig.orderBookMode || 'depth'}
                label="显示模式"
                onChange={(e) => updateConfig('orderBook', { orderBookMode: e.target.value as any })}
              >
                <MenuItem value="depth">按档位数量</MenuItem>
                <MenuItem value="priceRange">按价格区间</MenuItem>
              </Select>
            </FormControl>
            
            {orderBookConfig.orderBookMode === 'priceRange' ? (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="价格区间百分比"
                  value={orderBookConfig.priceRangePercent || 1}
                  onChange={(e) => updateConfig('orderBook', { priceRangePercent: parseFloat(e.target.value) || 1 })}
                  inputProps={{ min: 0.1, max: 50, step: 0.1 }}
                  helperText="显示当前价格±N%范围内的订单，如1表示±1%"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={orderBookConfig.aggregationEnabled || false}
                      onChange={(e) => updateConfig('orderBook', { aggregationEnabled: e.target.checked })}
                    />
                  }
                  label="启用价格聚合"
                />
                
                {orderBookConfig.aggregationEnabled && (
                  <>
                    <TextField
                      fullWidth
                      type="number"
                      label="聚合档位数量"
                      value={orderBookConfig.aggregationLevels || 20}
                      onChange={(e) => updateConfig('orderBook', { aggregationLevels: parseInt(e.target.value) || 20 })}
                      inputProps={{ min: 5, max: 100, step: 5 }}
                      helperText="将价格区间内的订单聚合为指定档位数量"
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>聚合模式</InputLabel>
                      <Select
                        value={orderBookConfig.aggregationMode || 'equal-price'}
                        label="聚合模式"
                        onChange={(e) => updateConfig('orderBook', { aggregationMode: e.target.value as any })}
                      >
                        <MenuItem value="equal-price">等价格间隔</MenuItem>
                        <MenuItem value="equal-quantity">等数量分组</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Typography variant="caption" color="text.secondary">
                      等价格间隔：按相等的价格区间进行聚合<br/>
                      等数量分组：按相等的数量进行分组聚合
                    </Typography>
                  </>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  根据当前最优买卖价的中间价计算区间。启用聚合可减少大区间时的数据量，提升可读性。
                </Typography>
              </>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel>档位深度</InputLabel>
                  <Select
                    value={orderBookConfig.depth || 20}
                    label="档位深度"
                    onChange={(e) => updateConfig('orderBook', { depth: parseInt(e.target.value as string) })}
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
                <Typography variant="caption" color="text.secondary">
                  订单薄显示的买卖档位数量
                </Typography>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

