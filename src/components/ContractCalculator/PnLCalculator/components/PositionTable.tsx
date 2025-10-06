import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import type { DndContextProps } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PositionRow from './PositionRow';
import TooltipIcon from '../../../common/TooltipIcon';
import { Position, PositionStat } from '../types';

interface PositionTableProps {
  positions: Position[];
  positionStats: Map<number, PositionStat>;
  leverage: number;
  sensors: DndContextProps['sensors'];
  onDragEnd: (event: DragEndEvent) => void;
  onAddPosition: () => void;
  insertPosition: (index: number, direction: 'above' | 'below') => void;
  removePosition: (id: number) => void;
  getInputValue: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', fallbackValue: number) => string;
  handleInputChange: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', value: string) => void;
  updatePosition: (id: number, field: keyof Position, value: unknown) => void;
  registerInputRef: (key: string) => (element: HTMLInputElement | null) => void;
  handleInputFocus: (key: string) => void;
  handleInputBlur: (key: string) => void;
}

export default function PositionTable({
  positions,
  positionStats,
  leverage,
  sensors,
  onDragEnd,
  onAddPosition,
  insertPosition,
  removePosition,
  getInputValue,
  handleInputChange,
  updatePosition,
  registerInputRef,
  handleInputFocus,
  handleInputBlur,
}: PositionTableProps) {
  return (
    <Box mb={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle2">委托单列表</Typography>
          <TooltipIcon title="添加多个委托单来模拟复杂的交易策略，支持开仓和平仓操作" />
        </Box>
        <Button size="small" startIcon={<AddIcon />} onClick={onAddPosition} variant="outlined">
          增加仓位
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
        <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
          <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%', minWidth: '1600px' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '50px' }}>
                  <Box display="flex" alignItems="center">
                    拖拽
                    <TooltipIcon title="拖拽行来重新排序委托单" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '50px' }}>
                  <Box display="flex" alignItems="center">
                    启用
                    <TooltipIcon title="勾选以启用此委托单参与计算" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '40px' }}>
                  <Box display="flex" alignItems="center">
                    序号
                    <TooltipIcon title="委托单的执行顺序编号" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '70px' }}>
                  <Box display="flex" alignItems="center">
                    委托单方向
                    <TooltipIcon title="开仓：建立新仓位；平仓：关闭现有仓位" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '96px' }}>
                  <Box display="flex" alignItems="center">
                    价格 (USDT)
                    <TooltipIcon title="委托单的执行价格，以USDT计价" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '96px' }}>
                  <Box display="flex" alignItems="center">
                    数量 (币)
                    <TooltipIcon title="委托单的交易数量，以币为单位" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '96px' }}>
                  <Box display="flex" alignItems="center">
                    杠杆前 (U)
                    <TooltipIcon title="未使用杠杆时的资金数量，即实际投入的本金" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '112px' }}>
                  <Box display="flex" alignItems="center">
                    杠杆后数量 (U)
                    <TooltipIcon title="使用杠杆后的总资金数量，即杠杆前资金 × 杠杆倍数" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    币价波动率
                    <TooltipIcon title="当前价格相对于开仓价格的涨跌幅百分比" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '160px' }}>
                  <Box display="flex" alignItems="center">
                    持有币 / 币成本价
                    <TooltipIcon title="当前持有的币数量和平均成本价格" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    占用本金 (U)
                    <TooltipIcon title="此委托单占用的实际资金数量" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '80px', lineHeight: 1.2 }}>
                  <Box display="flex" alignItems="center">
                    资金使用率
                    <TooltipIcon title="占用本金占总资金的比例" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px', lineHeight: 1.2 }}>
                  <Box display="flex" alignItems="center">
                    实际资金使用率
                    <TooltipIcon title="考虑杠杆后的实际资金使用率，即资金使用率 × 杠杆倍数" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    盈亏计算
                    <TooltipIcon title="此委托单的累计盈亏金额" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    爆仓价格
                    <TooltipIcon title="触发强制平仓的价格点位" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    操作
                    <TooltipIcon title="插入、删除等操作按钮" />
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <SortableContext items={positions.map(position => position.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {positions.map((position, index) => (
                  <PositionRow
                    key={position.id}
                    position={position}
                    index={index}
                    stats={positionStats.get(position.id)}
                    leverage={leverage}
                    getInputValue={getInputValue}
                    handleInputChange={handleInputChange}
                    updatePosition={updatePosition}
                    insertPosition={insertPosition}
                    removePosition={removePosition}
                    registerInputRef={registerInputRef}
                    handleInputFocus={handleInputFocus}
                    handleInputBlur={handleInputBlur}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </TableContainer>
    </Box>
  );
}
