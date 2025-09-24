/**
 * 金字塔加仓计算器表格组件
 */

import React from 'react';
import {
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
import { PyramidLevel } from '../../types/pyramid';
import { formatNumber, formatPercentage } from '../../utils/pyramidCalculations';

interface PyramidCalculatorTableProps {
  levels: PyramidLevel[];
}

export default function PyramidCalculatorTable({ levels }: PyramidCalculatorTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: 600,
        overflowX: 'hidden', // 移除水平滚动条
        width: '100%'
      }}
    >
      <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: '8%', minWidth: '60px' }}>档位</TableCell>
            <TableCell align="center" sx={{ width: '12%', minWidth: '100px' }}>开仓价格</TableCell>
            <TableCell align="center" sx={{ width: '10%', minWidth: '80px' }}>仓位大小</TableCell>
            <TableCell align="center" sx={{ width: '11%', minWidth: '90px' }}>保证金</TableCell>
            <TableCell align="center" sx={{ width: '10%', minWidth: '80px' }}>累计持仓</TableCell>
            <TableCell align="center" sx={{ width: '12%', minWidth: '100px' }}>累计保证金</TableCell>
            <TableCell align="center" sx={{ width: '12%', minWidth: '100px' }}>持仓均价</TableCell>
            <TableCell align="center" sx={{ width: '12%', minWidth: '100px' }}>强平价格</TableCell>
            <TableCell align="center" sx={{ width: '13%', minWidth: '80px' }}>回撤幅度</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {levels.map((level) => (
            <TableRow key={level.level} hover>
              <TableCell align="center" sx={{ width: '8%', padding: '8px 4px' }}>
                <Chip
                  label={`第${level.level}档`}
                  color={level.level === 1 ? 'primary' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center" sx={{ width: '12%', padding: '8px 4px' }}>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                  ${formatNumber(level.price)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ width: '10%', padding: '8px 4px' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {formatNumber(level.quantity)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ width: '11%', padding: '8px 4px' }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  ${formatNumber(level.margin, 2)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ width: '10%', padding: '8px 4px' }}>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                  {formatNumber(level.cumulativeQuantity)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ width: '12%', padding: '8px 4px' }}>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                  ${formatNumber(level.cumulativeMargin, 2)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ width: '12%', padding: '8px 4px' }}>
                <Typography variant="body2" color="primary.main" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                  ${formatNumber(level.averagePrice)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ width: '12%', padding: '8px 4px' }}>
                <Typography variant="body2" color="error.main" sx={{ fontSize: '0.75rem' }}>
                  ${formatNumber(level.liquidationPrice)}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ width: '13%', padding: '8px 4px' }}>
                {level.level === 1 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                    -
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    color={level.priceDropFromPrevious > 0 ? 'error.main' : 'success.main'}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {formatPercentage(level.priceDropFromPrevious)}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
