import React from 'react';
import { Box, Button, LinearProgress } from '@mui/material';
import { FormSubmitButtonProps } from './types';

export function FormSubmitButton({
  children,
  loading = false,
  disabled = false,
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
}: FormSubmitButtonProps) {
  return (
    <Box position="relative">
      <Button
        type={type}
        variant={variant}
        color={color}
        fullWidth={fullWidth}
        disabled={disabled || loading}
        startIcon={!loading ? startIcon : undefined}
        endIcon={!loading ? endIcon : undefined}
        onClick={onClick}
        sx={{
          minHeight: 48,
          position: 'relative',
        }}
      >
        {children}
      </Button>
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: '0 0 4px 4px',
          }}
        />
      )}
    </Box>
  );
}
