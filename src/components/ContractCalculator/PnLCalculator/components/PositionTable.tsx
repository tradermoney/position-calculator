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

      <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
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
                    <TooltipIcon title="勾选以启用此委托单参与计算。取消勾选后，该委托单将不参与盈亏计算和统计，但不会被删除。此功能允许您临时禁用某些委托单，用于测试不同策略或排除异常数据。系统会实时更新计算结果，禁用委托单后相关统计信息会相应调整。建议在测试阶段使用此功能来比较不同策略的效果。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '40px' }}>
                  <Box display="flex" alignItems="center">
                    序号
                    <TooltipIcon title="委托单的执行顺序编号。序号决定委托单的执行顺序，影响盈亏计算和仓位管理。系统按照序号顺序处理委托单，先执行序号小的委托单。您可以通过拖拽调整委托单顺序，系统会自动重新编号。正确的执行顺序对于复杂策略至关重要，例如：先开仓后平仓，分批建仓等。建议根据实际交易计划设置合理的执行顺序。" />
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
                    <TooltipIcon title="委托单的执行价格，以USDT计价。开仓价格决定您的建仓成本，平仓价格决定您的退出收益。价格输入支持小数点后8位精度，建议使用当前市场价格或您的预期交易价格。对于市价单，请输入当前市场价格；对于限价单，请输入您设定的限价。价格变动直接影响盈亏计算，做多时价格上涨盈利，做空时价格下跌盈利。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '96px' }}>
                  <Box display="flex" alignItems="center">
                    数量 (币)
                    <TooltipIcon title="委托单的交易数量，以币为单位。数量决定仓位大小，直接影响盈亏金额。计算公式：数量 = 杠杆前资金 / 价格。支持小数点后8位精度输入。开仓数量为正数，平仓数量为负数或正数（系统会自动判断）。总开仓数量必须等于总平仓数量才能完全平仓。数量越大，价格波动对盈亏的影响越大，风险也越高。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '96px' }}>
                  <Box display="flex" alignItems="center">
                    杠杆前 (U)
                    <TooltipIcon title="未使用杠杆时的资金数量，即实际投入的本金。这是您真正投入的资金，不包含杠杆放大。计算公式：杠杆前资金 = 价格 × 数量。此金额直接影响您的最大亏损，因为即使价格归零，您最多只会亏损这个金额。杠杆前资金越大，您的风险承受能力越强，但同时也意味着更大的资金占用。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '112px' }}>
                  <Box display="flex" alignItems="center">
                    杠杆后数量 (U)
                    <TooltipIcon title="使用杠杆后的总资金数量，即杠杆前资金 × 杠杆倍数。这表示您实际控制的资金规模。例如：1000U本金，10倍杠杆，杠杆后数量为10000U。杠杆后数量决定您的盈亏幅度，价格每变动1%，您的盈亏就是杠杆后数量的1%。杠杆越高，盈亏幅度越大，风险也越高。此数值用于计算实际盈亏金额。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    币价波动率
                    <TooltipIcon title="当前价格相对于开仓价格的涨跌幅百分比。计算公式：波动率 = (当前价格 - 开仓价格) / 开仓价格 × 100%。正值表示价格上涨，负值表示价格下跌。此指标帮助您快速了解价格变动幅度，结合杠杆倍数可以估算盈亏情况。例如：10倍杠杆下，价格波动1%，您的盈亏就是10%。波动率越高，风险越大，需要密切关注市场动态。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '160px' }}>
                  <Box display="flex" alignItems="center">
                    持有币 / 币成本价
                    <TooltipIcon title="当前持有的币数量和平均成本价格。持有币数量 = 累计开仓数量 - 累计平仓数量。平均成本价 = 累计开仓成本 / 累计开仓数量。此信息帮助您了解当前仓位状态，当持有币数量为0时表示已完全平仓。平均成本价是盈亏计算的重要参考，当前价格高于平均成本价时盈利，低于时亏损。系统会自动计算和更新这些数值。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    占用本金 (U)
                    <TooltipIcon title="此委托单占用的实际资金数量。对于开仓单，占用本金 = 杠杆前资金；对于平仓单，占用本金 = 0（平仓不占用新资金）。占用本金是您实际投入的资金，直接影响资金使用率计算。总占用本金不能超过您的总资金，否则会出现资金不足的情况。此数值帮助您管理资金分配，避免过度杠杆。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '80px', lineHeight: 1.2 }}>
                  <Box display="flex" alignItems="center">
                    资金使用率
                    <TooltipIcon title="占用本金占总资金的比例。计算公式：资金使用率 = 占用本金 / 总资金 × 100%。此指标帮助您了解资金利用情况，建议保持在80%以下以留有余地。资金使用率过高会增加爆仓风险，因为剩余资金不足以应对价格波动。系统会实时计算并显示当前资金使用率，帮助您合理分配资金。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px', lineHeight: 1.2 }}>
                  <Box display="flex" alignItems="center">
                    实际资金使用率
                    <TooltipIcon title="考虑杠杆后的实际资金使用率，即资金使用率 × 杠杆倍数。此指标反映您实际控制的资金规模相对于总资金的比例。例如：1000U总资金，10倍杠杆，实际控制10000U，实际资金使用率为1000%。此数值帮助您了解杠杆放大效果，数值越高表示杠杆使用越充分，但风险也越大。建议根据风险承受能力合理控制实际资金使用率。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    盈亏计算
                    <TooltipIcon title="此委托单的累计盈亏金额。计算公式：做多盈亏 = (平仓价格 - 开仓价格) × 数量，做空盈亏 = (开仓价格 - 平仓价格) × 数量。此数值显示该委托单对总盈亏的贡献，正值表示盈利，负值表示亏损。系统会实时计算并更新，帮助您了解每个委托单的盈亏情况。注意：此计算不考虑手续费和滑点，实际交易中会有额外成本。" />
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem', width: '100px' }}>
                  <Box display="flex" alignItems="center">
                    爆仓价格
                    <TooltipIcon title="触发强制平仓的价格点位。计算公式：做多爆仓价 = 开仓价 × (1 - 维持保证金率)，做空爆仓价 = 开仓价 × (1 + 维持保证金率)。维持保证金率 = 1/杠杆倍数 - 2%强平清算费用。注意：本计算器已考虑2%的强平清算费用，与交易所实际爆仓价格可能存在细微差异，实际交易中请以交易所显示为准。强平清算费用是交易所强制平仓时收取的额外费用，用于覆盖平仓时的市场冲击成本。" />
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
