import { LiquidationPriceCalculatorParams } from '../../../utils/contractCalculations';

export interface LiquidationFormProps {
  params: LiquidationPriceCalculatorParams;
  onParamsChange: (params: LiquidationPriceCalculatorParams) => void;
  onCalculate: () => void;
  onReset: () => void;
  errors: string[];
}

export { LiquidationPriceCalculatorParams };
