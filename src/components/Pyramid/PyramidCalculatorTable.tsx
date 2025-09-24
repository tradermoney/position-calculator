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
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center">档位</TableCell>
            <TableCell align="center">开仓价格</TableCell>
            <TableCell align="center">仓位大小</TableCell>
            <TableCell align="center">保证金</TableCell>
            <TableCell align="center">累计持仓</TableCell>
            <TableCell align="center">累计保证金</TableCell>
            <TableCell align="center">持仓均价</TableCell>
            <TableCell align="center">强平价格</TableCell>
            <TableCell align="center">回撤幅度</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {levels.map((level) => (
            <TableRow key={level.level} hover>
              <TableCell align="center">
                <Chip
                  label={`第${level.level}档`}
                  color={level.level === 1 ? 'primary' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight={500}>
                  ${formatNumber(level.price)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">
                  {formatNumber(level.quantity)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">
                  ${formatNumber(level.margin, 2)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight={500}>
                  {formatNumber(level.cumulativeQuantity)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight={500}>
                  ${formatNumber(level.cumulativeMargin, 2)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" color="primary.main" fontWeight={500}>
                  ${formatNumber(level.averagePrice)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" color="error.main">
                  ${formatNumber(level.liquidationPrice)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {level.level === 1 ? (
                  <Typography variant="body2" color="textSecondary">
                    -
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    color={level.priceDropFromPrevious > 0 ? 'error.main' : 'success.main'}
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
