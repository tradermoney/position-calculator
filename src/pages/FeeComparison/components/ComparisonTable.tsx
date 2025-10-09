import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { FeeComparisonResult } from '../types';

interface ComparisonTableProps {
  results: FeeComparisonResult[];
}

export default function ComparisonTable({ results }: ComparisonTableProps) {
  if (results.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 1,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          请选择至少一个交易所进行对比
        </Typography>
      </Box>
    );
  }

  // 找出费用最低的交易所
  const lowestFeeResult = results.reduce((min, current) =>
    current.totalFee < min.totalFee ? current : min
  );

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const formatCurrency = (num: number) => {
    return `$${formatNumber(num, 4)}`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        费率对比结果
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>交易所</TableCell>
              <TableCell align="right">Maker费率</TableCell>
              <TableCell align="right">Taker费率</TableCell>
              <TableCell align="right">综合费率</TableCell>
              <TableCell align="right">Maker费用</TableCell>
              <TableCell align="right">Taker费用</TableCell>
              <TableCell align="right">总费用</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => {
              const isLowest = result.exchange.id === lowestFeeResult.exchange.id;
              return (
                <TableRow
                  key={result.exchange.id}
                  sx={{
                    backgroundColor: isLowest ? 'success.light' : 'inherit',
                    '&:hover': {
                      backgroundColor: isLowest ? 'success.light' : 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {result.exchange.name}
                      {isLowest && (
                        <Chip
                          label="最优"
                          size="small"
                          color="success"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(result.exchange.makerFee, 3)}%
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(result.exchange.takerFee, 3)}%
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isLowest ? 600 : 400,
                        color: isLowest ? 'success.dark' : 'inherit',
                      }}
                    >
                      {formatNumber(result.feeRate, 3)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(result.makerFee)}</TableCell>
                  <TableCell align="right">{formatCurrency(result.takerFee)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isLowest ? 600 : 400,
                        color: isLowest ? 'success.dark' : 'inherit',
                      }}
                    >
                      {formatCurrency(result.totalFee)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 费用差异分析 */}
      {results.length > 1 && (
        <Box
          sx={{
            p: 2,
            backgroundColor: 'info.light',
            borderRadius: 1,
            color: 'info.contrastText',
          }}
        >
          <Typography variant="body2" gutterBottom>
            <strong>对比分析：</strong>
          </Typography>
          <Typography variant="body2">
            • 最低费用：{lowestFeeResult.exchange.name} - {formatCurrency(lowestFeeResult.totalFee)}
          </Typography>
          <Typography variant="body2">
            • 最高费用：
            {
              results.reduce((max, current) =>
                current.totalFee > max.totalFee ? current : max
              ).exchange.name
            }{' '}
            -{' '}
            {formatCurrency(
              results.reduce((max, current) =>
                current.totalFee > max.totalFee ? current : max
              ).totalFee
            )}
          </Typography>
          <Typography variant="body2">
            • 费用差距：
            {formatCurrency(
              results.reduce((max, current) =>
                current.totalFee > max.totalFee ? current : max
              ).totalFee - lowestFeeResult.totalFee
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
}


