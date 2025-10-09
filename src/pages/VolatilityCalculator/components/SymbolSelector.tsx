/**
 * 交易对选择器组件
 * 支持搜索和选择币安合约交易对
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { binanceDataService, type SymbolListItem, ContractType } from '../../../services/binance';

export interface SymbolSelectorProps {
  /** 当前选中的交易对 */
  value: string | null;
  /** 交易对变更回调 */
  onChange: (symbol: string | null) => void;
  /** 合约类型，默认为永续合约 */
  contractType?: ContractType;
  /** 报价货币过滤，默认为USDT */
  quoteAsset?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 交易对选择器组件
 */
export function SymbolSelector({
  value,
  onChange,
  contractType = ContractType.PERPETUAL,
  quoteAsset = 'USDT',
  disabled = false,
}: SymbolSelectorProps) {
  const [symbols, setSymbols] = useState<SymbolListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载交易对列表
  useEffect(() => {
    loadSymbols();
  }, [contractType, quoteAsset]);

  const loadSymbols = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await binanceDataService.getSymbols(contractType, quoteAsset);
      setSymbols(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载交易对失败');
      console.error('加载交易对失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 过滤交易对
  const filteredSymbols = useMemo(() => {
    if (!searchKeyword) {
      return symbols;
    }
    const upperKeyword = searchKeyword.toUpperCase();
    return symbols.filter(s => 
      s.symbol.includes(upperKeyword) ||
      s.baseAsset.includes(upperKeyword)
    );
  }, [symbols, searchKeyword]);

  // 当前选中的交易对对象
  const selectedSymbol = useMemo(() => {
    if (!value) return null;
    return symbols.find(s => s.symbol === value) || null;
  }, [value, symbols]);

  // 热门交易对
  const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        选择交易对
      </Typography>

      {/* 交易对选择器 */}
      <Autocomplete
        value={selectedSymbol}
        onChange={(_, newValue) => {
          onChange(newValue?.symbol || null);
        }}
        inputValue={searchKeyword}
        onInputChange={(_, newValue) => {
          setSearchKeyword(newValue);
        }}
        options={filteredSymbols}
        getOptionLabel={(option) => option.symbol}
        loading={loading}
        disabled={disabled}
        noOptionsText={error || "未找到交易对"}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="搜索交易对 (如: BTC, ETH)"
            variant="outlined"
            size="small"
            error={!!error}
            helperText={error}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <TrendingUpIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.symbol}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                {option.baseAsset}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / {option.quoteAsset}
              </Typography>
            </Box>
          </li>
        )}
        sx={{ mb: 2 }}
      />

      {/* 热门交易对快捷选择 */}
      {!value && !searchKeyword && (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            热门交易对:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {popularSymbols.map((symbol) => (
              <Chip
                key={symbol}
                label={symbol}
                size="small"
                onClick={() => onChange(symbol)}
                disabled={disabled || loading}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 当前选择信息 */}
      {selectedSymbol && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            已选择: <strong>{selectedSymbol.baseAsset}/{selectedSymbol.quoteAsset}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SymbolSelector;

