import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import PnLCalculator from '../components/ContractCalculator/PnLCalculator';

export default function PnLCalculatorPage() {
  usePageTitle('pnl-calculator');

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 0, sm: 1, md: 2, lg: 3, xl: 4 } }}>
      {/* 页面标题 */}
      <Box mb={3} sx={{ px: { xs: 1, sm: 0 } }}>
        <Box display="flex" alignItems="center" mb={2}>
          <CalculateIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            盈亏计算器
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          计算合约交易的盈利/亏损、回报率和起始保证金，帮助您评估交易风险和收益
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Box sx={{ px: { xs: 0, sm: 0 } }}>
        <PnLCalculator />
      </Box>

      {/* 使用说明 */}
      <Box mt={3} sx={{ px: { xs: 1, sm: 0 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              使用说明
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>开仓价格</strong>：输入您的开仓价格（必填）。开仓价格是您建立仓位的价格，直接影响盈亏计算。对于做多，开仓价格越低越好；对于做空，开仓价格越高越好。价格输入支持小数点后8位精度，建议使用当前市场价格或您的预期交易价格。开仓价格与平仓价格的差额乘以数量就是盈亏金额，是计算盈亏的核心参数。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>平仓价格</strong>：输入预期或实际的平仓价格（必填）。平仓价格是您关闭仓位的价格，与开仓价格共同决定盈亏。对于做多，平仓价格高于开仓价格时盈利；对于做空，平仓价格低于开仓价格时盈利。价格输入支持小数点后8位精度，建议根据技术分析或市场预期设置合理的平仓价格。平仓价格与开仓价格的差额乘以数量就是盈亏金额。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>数量</strong>：输入交易的合约数量（必填）。数量决定仓位大小，直接影响盈亏金额。数量越大，价格波动对盈亏的影响越大，风险也越高。计算公式：数量 = 杠杆前资金 / 价格。支持小数点后8位精度输入，建议根据资金规模和风险承受能力合理设置数量。数量与价格的乘积就是仓位价值，是计算保证金和盈亏的重要参数。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>杠杆倍数</strong>：选择使用的杠杆倍数，影响保证金计算。杠杆倍数决定资金放大比例，杠杆越高，盈亏幅度越大，风险也越高。计算公式：实际控制资金 = 本金 × 杠杆倍数，保证金 = 仓位价值 / 杠杆倍数。杠杆倍数还影响爆仓价格计算，杠杆越高，爆仓价格越接近开仓价格。建议根据风险承受能力和市场波动选择合适的杠杆倍数，新手建议使用较低杠杆。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>交易方向</strong>：选择做多或做空，影响盈亏计算方向。做多表示预期价格上涨，买入后等待价格上涨卖出获利，盈亏计算公式为(平仓价-开仓价)×数量。做空表示预期价格下跌，先卖出后等待价格下跌买入获利，盈亏计算公式为(开仓价-平仓价)×数量。交易方向直接影响盈亏计算逻辑，选择错误会导致盈亏计算相反。建议根据市场分析和技术指标选择合适的交易方向。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>手续费率</strong>：输入交易手续费率，用于计算净盈亏。手续费率是交易所收取的交易费用比例，通常为0.1%-0.2%。手续费计算公式：手续费 = (开仓价格 + 平仓价格) × 数量 × 手续费率。净盈亏 = 盈亏金额 - 手续费。手续费会减少实际收益，是交易成本的重要组成部分。建议根据实际交易所的手续费率设置，以获得更准确的净盈亏计算结果。
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 计算公式说明 */}
      <Box mt={3} sx={{ px: { xs: 1, sm: 0 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              计算公式
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>做多盈亏</strong>：(平仓价格 - 开仓价格) × 数量。做多是指预期价格上涨，买入后等待价格上涨卖出获利。当平仓价格高于开仓价格时盈利，低于时亏损。盈亏金额与价格差额和数量成正比，数量越大，盈亏幅度越大。此公式是计算做多交易盈亏的基础，适用于所有做多策略的盈亏计算。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>做空盈亏</strong>：(开仓价格 - 平仓价格) × 数量。做空是指预期价格下跌，先卖出后等待价格下跌买入获利。当平仓价格低于开仓价格时盈利，高于时亏损。盈亏金额与价格差额和数量成正比，数量越大，盈亏幅度越大。此公式是计算做空交易盈亏的基础，适用于所有做空策略的盈亏计算。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>回报率</strong>：盈亏金额 ÷ 起始保证金 × 100%。回报率是衡量投资效果的核心指标，表示单位投入的收益率。起始保证金 = 开仓价格 × 数量 ÷ 杠杆倍数。回报率越高，表示投资效果越好，但也要考虑风险因素。例如：1000U保证金，盈利100U，回报率为10%。此指标帮助您比较不同投资策略的效果。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>起始保证金</strong>：开仓价格 × 数量 ÷ 杠杆倍数。起始保证金是您实际投入的资金，不包含杠杆放大。杠杆倍数越高，所需保证金越少，但风险也越高。保证金是计算回报率和爆仓价格的重要参数。例如：50000U开仓价，0.01数量，10倍杠杆，保证金 = 50000 × 0.01 ÷ 10 = 50U。此数值是风险控制的重要参考。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>手续费</strong>：(开仓价格 + 平仓价格) × 数量 × 手续费率
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>净盈亏</strong>：盈亏金额 - 手续费
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>爆仓价格</strong>：做多爆仓价 = 开仓价 × (1 - 维持保证金率)，做空爆仓价 = 开仓价 × (1 + 维持保证金率)。维持保证金率 = 1/杠杆倍数 - 2%强平清算费用。注意：本计算器已考虑2%的强平清算费用，与交易所实际爆仓价格可能存在细微差异。强平清算费用是交易所强制平仓时收取的额外费用，用于覆盖平仓时的市场冲击成本。
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
