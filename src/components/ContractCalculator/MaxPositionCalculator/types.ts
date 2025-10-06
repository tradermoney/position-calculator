import { MaxPositionCalculatorParams } from '../../../utils/contractCalculations';

export interface MaxPositionFormProps {
  params: MaxPositionCalculatorParams;
  onParamsChange: (params: MaxPositionCalculatorParams) => void;
  onCalculate: () => void;
  onReset: () => void;
  errors: string[];
}

export { MaxPositionCalculatorParams };
