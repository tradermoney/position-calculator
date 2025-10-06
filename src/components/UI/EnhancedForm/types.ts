import React from 'react';

export interface ValidationRule {
  test: (value: string | number) => boolean;
  message: string;
}

export interface EnhancedTextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  tooltip?: string;
  startAdornment?: string;
  endAdornment?: string;
  validationRules?: ValidationRule[];
  showValidation?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface FormSubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}
