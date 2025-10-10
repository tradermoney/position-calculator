/**
 * 使用说明卡片组件
 */

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const UsageGuideCard: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          使用说明
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="body2" paragraph>
            • <strong>资金费率</strong>：永续合约特有的机制，用于锚定合约价格和现货价格
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>结算周期</strong>：币安每8小时结算一次资金费率（00:00、08:00、16:00 UTC）
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>费用计算</strong>：资金费用 = 仓位价值 × 资金费率 × 持有周期数
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>费率方向</strong>：
            <br />
            　- 正费率：做多方支付给做空方
            <br />
            　- 负费率：做空方支付给做多方
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>对冲仓位</strong>：同时持有做多和做空仓位时，系统会自动计算净成本
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>预估依据</strong>：基于最近7天的历史数据计算平均费率，实际费率可能波动
          </Typography>
          <Typography variant="body2">
            • <strong>数据来源</strong>：币安合约API实时数据
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UsageGuideCard;

