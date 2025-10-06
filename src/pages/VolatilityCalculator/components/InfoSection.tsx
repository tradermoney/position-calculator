import React from 'react';
import { Info as InfoIcon } from '@mui/icons-material';
import { CalculationMode } from '../types';
import { InfoText } from '../../../styles/volatilityCalculator';

interface InfoSectionProps {
  calculationMode: CalculationMode;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ calculationMode }) => {
  return (
    <InfoText>
      <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
      <strong>使用说明：</strong>
      {calculationMode === CalculationMode.FORWARD ? (
        <>
          <strong>正向计算：</strong>输入起始价格和目标价格后自动计算波动率。
          波动率 = |目标价格-起始价格|/max(起始价格,目标价格)×100%。
          正号表示上涨（目标价格大于起始价格），负号表示下跌（目标价格小于起始价格）。
        </>
      ) : (
        <>
          <strong>反向计算：</strong>输入起始价格和波动率后自动计算目标价格。
          目标价格 = 起始价格 ÷ (1 - 波动率/100)。
          此计算假设价格上涨，如需计算下跌情况，请使用负波动率。
        </>
      )}
      可选择输入投资金额，系统将计算该金额在当前波动率下的波动区间。
      点击"保存记录"可将当前计算保存到历史记录中。
    </InfoText>
  );
};
