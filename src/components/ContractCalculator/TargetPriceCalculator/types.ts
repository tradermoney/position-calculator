import { TargetPriceCalculatorParams } from '../../../utils/contractCalculations';

export interface TargetPriceFormProps {
  params: TargetPriceCalculatorParams;
  onParamsChange: (params: TargetPriceCalculatorParams) => void;
  onCalculate: () => void;
  onReset: () => void;
  errors: string[];
}

export { TargetPriceCalculatorParams };
