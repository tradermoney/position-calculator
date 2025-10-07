import React, { useState, useEffect } from 'react';
import { Container, Paper, Box, Grid, Divider } from '@mui/material';
import InputForm from './components/InputForm';
import ExchangeSelector from './components/ExchangeSelector';
import ComparisonTable from './components/ComparisonTable';
import { FeeComparisonInput, ExchangeFeeConfig, FeeComparisonResult } from './types';
import { EXCHANGE_PRESETS, DEFAULT_SELECTED_EXCHANGES } from './utils/exchangePresets';
import { calculateAllExchangeFees, validateInput } from './utils/calculations';

const INITIAL_INPUT: FeeComparisonInput = {
  tradeAmount: 1000000,
  leverage: 10,
  makerRatio: 70,
  takerRatio: 30,
};

export default function FeeComparison() {
  const [input, setInput] = useState<FeeComparisonInput>(INITIAL_INPUT);
  const [allExchanges, setAllExchanges] = useState<ExchangeFeeConfig[]>(EXCHANGE_PRESETS);
  const [selectedExchangeIds, setSelectedExchangeIds] = useState<string[]>(
    DEFAULT_SELECTED_EXCHANGES
  );
  const [results, setResults] = useState<FeeComparisonResult[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // 自动计算结果
  useEffect(() => {
    const validationErrors = validateInput(input);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const selectedExchanges = allExchanges.filter((ex) =>
        selectedExchangeIds.includes(ex.id)
      );
      const calculatedResults = calculateAllExchangeFees(selectedExchanges, input);
      // 按总费用排序
      calculatedResults.sort((a, b) => a.totalFee - b.totalFee);
      setResults(calculatedResults);
    } else {
      setResults([]);
    }
  }, [input, selectedExchangeIds, allExchanges]);

  const handleAddCustomExchange = (exchange: ExchangeFeeConfig) => {
    setAllExchanges([...allExchanges, exchange]);
    setSelectedExchangeIds([...selectedExchangeIds, exchange.id]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 左侧：输入参数 */}
          <Grid item xs={12} md={4}>
            <InputForm input={input} onChange={setInput} errors={errors} />
          </Grid>

          {/* 右侧：交易所选择和结果 */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <ExchangeSelector
                allExchanges={allExchanges}
                selectedIds={selectedExchangeIds}
                onSelectionChange={setSelectedExchangeIds}
                onAddCustomExchange={handleAddCustomExchange}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <ComparisonTable results={results} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

