import React from 'react';
import { Typography, TextField, Alert } from '@mui/material';
import { DisplaySection } from '../../../styles/calculator';

interface DisplayAreaProps {
  isEditing: boolean;
  expression: string;
  display: string;
  isResult: boolean;
  error: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleExpressionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  exitEditMode: () => void;
  enterEditMode: () => void;
  setCursorPosition: (position: number) => void;
}

export function DisplayArea({
  isEditing,
  expression,
  display,
  isResult,
  error,
  inputRef,
  handleExpressionChange,
  handleKeyDown,
  exitEditMode,
  enterEditMode,
  setCursorPosition,
}: DisplayAreaProps) {
  return (
    <DisplaySection>
      <Typography variant="body2" color="textSecondary" sx={{ minHeight: '20px', mb: 1 }}>
        {!isEditing && expression && !isResult ? expression : ''}
      </Typography>

      {isEditing ? (
        <TextField
          ref={inputRef}
          value={expression}
          onChange={handleExpressionChange}
          onKeyDown={handleKeyDown}
          onBlur={exitEditMode}
          onSelect={(e) => {
            const target = e.target as HTMLInputElement;
            const newPos = target.selectionStart ?? 0;
            setCursorPosition(newPos);
            console.log('onSelect - cursor position updated to:', newPos);
          }}
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            const newPos = target.selectionStart ?? 0;
            setCursorPosition(newPos);
            console.log('onClick - cursor position updated to:', newPos);
          }}
          variant="outlined"
          fullWidth
          placeholder="输入表达式..."
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace',
              fontSize: '1.5rem',
              textAlign: 'right',
              '& fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
              padding: '12px 14px',
            },
          }}
        />
      ) : (
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'monospace',
            textAlign: 'right',
            wordBreak: 'break-all',
            minHeight: '40px',
            color: isResult ? 'primary.main' : 'text.primary',
            cursor: 'pointer',
            padding: '8px',
            border: '2px solid transparent',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'action.hover',
              border: '2px solid',
              borderColor: 'primary.main',
            },
          }}
          onClick={enterEditMode}
        >
          {display}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </DisplaySection>
  );
}
