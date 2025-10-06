import React from 'react';
import { Grid, Button } from '@mui/material';
import { Backspace as BackspaceIcon } from '@mui/icons-material';
import { ButtonSection } from '../../../styles/calculator';

interface ButtonPanelProps {
  isEditing: boolean;
  handleClear: () => void;
  handleBackspace: () => void;
  handleInput: (value: string) => void;
  handleCalculate: () => void;
}

export function ButtonPanel({
  isEditing,
  handleClear,
  handleBackspace,
  handleInput,
  handleCalculate,
}: ButtonPanelProps) {
  return (
    <ButtonSection>
      <Grid container spacing={1}>
        {/* 第一行：清空、退格、括号 */}
        <Grid item xs={3}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClear}
            sx={{ height: 60, fontSize: '1.1rem' }}
          >
            C
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleBackspace}
            sx={{ height: 60 }}
          >
            <BackspaceIcon />
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleInput('(')}
            sx={{ height: 60, fontSize: '1.1rem' }}
          >
            (
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleInput(')')}
            sx={{ height: 60, fontSize: '1.1rem' }}
          >
            )
          </Button>
        </Grid>

        {/* 数字行 7-9 */}
        {['7', '8', '9'].map((num) => (
          <Grid item xs={3} key={num}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleInput(num)}
              sx={{ height: 60, fontSize: '1.2rem' }}
            >
              {num}
            </Button>
          </Grid>
        ))}
        <Grid item xs={3}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => handleInput('/')}
            sx={{ height: 60, fontSize: '1.2rem' }}
          >
            ÷
          </Button>
        </Grid>

        {/* 数字行 4-6 */}
        {['4', '5', '6'].map((num) => (
          <Grid item xs={3} key={num}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleInput(num)}
              sx={{ height: 60, fontSize: '1.2rem' }}
            >
              {num}
            </Button>
          </Grid>
        ))}
        <Grid item xs={3}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => handleInput('*')}
            onMouseDown={(e) => {
              if (isEditing) {
                e.preventDefault();
              }
            }}
            sx={{ height: 60, fontSize: '1.2rem' }}
          >
            ×
          </Button>
        </Grid>

        {/* 数字行 1-3 */}
        {['1', '2', '3'].map((num) => (
          <Grid item xs={3} key={num}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleInput(num)}
              sx={{ height: 60, fontSize: '1.2rem' }}
            >
              {num}
            </Button>
          </Grid>
        ))}
        <Grid item xs={3}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => handleInput('-')}
            sx={{ height: 60, fontSize: '1.2rem' }}
          >
            −
          </Button>
        </Grid>

        {/* 第五行：0、小数点、加法 */}
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleInput('0')}
            sx={{ height: 60, fontSize: '1.2rem' }}
          >
            0
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleInput('.')}
            sx={{ height: 60, fontSize: '1.2rem' }}
          >
            .
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => handleInput('+')}
            sx={{ height: 60, fontSize: '1.2rem' }}
          >
            +
          </Button>
        </Grid>

        {/* 等号 */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCalculate}
            sx={{ height: 60, fontSize: '1.3rem', fontWeight: 'bold' }}
          >
            =
          </Button>
        </Grid>
      </Grid>
    </ButtonSection>
  );
}
